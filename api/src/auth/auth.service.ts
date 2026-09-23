import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '@db/prisma.service.js';
import { AppException } from '@common/errors/app.exception.js';
import { AUTH_ERROR_CODES } from '@common/errors/error-codes.js';
import {
  PASSWORD_RESET_TTL_MINUTES,
  REFRESH_TOKEN_TTL_HOURS,
} from './auth.constants.js';
import { generateOpaqueToken, hashOpaqueToken } from './token.util.js';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface.js';
import type { Role } from '@generated/prisma/enums.js';

interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

interface CurrentUserProfile {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
}

function refreshTokenExpiry(): Date {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<IssuedTokens> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await argon2.verify(user.passwordHash, password))) {
      throw new AppException(
        AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        'Invalid email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const rawRefreshToken = generateOpaqueToken();
    await this.prisma.refreshToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tokenHash: hashOpaqueToken(rawRefreshToken),
        previousTokenHash: null,
        expiresAt: refreshTokenExpiry(),
      },
      update: {
        tokenHash: hashOpaqueToken(rawRefreshToken),
        previousTokenHash: null,
        expiresAt: refreshTokenExpiry(),
      },
    });

    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
        role: user.role,
      }),
      refreshToken: rawRefreshToken,
      user: authUser,
    };
  }

  /**
   * Rotates the refresh token under a row lock.
   *
   * The row keeps both the current hash and the immediately-previous one.
   * A match against the *previous* slot means this exact token was already
   * superseded by a successful rotation — i.e. it's being reused — which is
   * the theft signal: the whole session is revoked outright. A match
   * against neither slot (row not found by either hash) means the token
   * was never valid, or its session is already gone; no session to revoke.
   */
  async refresh(presentedToken: string): Promise<IssuedTokens> {
    const presentedHash = hashOpaqueToken(presentedToken);
    const existing = await this.prisma.refreshToken.findFirst({
      where: {
        OR: [
          { tokenHash: presentedHash },
          { previousTokenHash: presentedHash },
        ],
      },
    });

    if (!existing) {
      throw new AppException(
        AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
        'Invalid refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Throwing inside a $transaction callback rolls back everything in it —
    // including a revocation delete. So the callback only ever returns a
    // result; the transaction always commits, and we throw afterward based
    // on that result, once the revoke (if any) has actually persisted.
    type Outcome =
      | { kind: 'reuse' | 'expired' | 'invalid' }
      | ({ kind: 'success' } & IssuedTokens);

    const outcome = await this.prisma.$transaction(
      async (tx): Promise<Outcome> => {
        const rows = await tx.$queryRaw<
          {
            id: string;
            tokenHash: string;
            previousTokenHash: string | null;
            userId: string;
            expiresAt: Date;
          }[]
        >`SELECT id, "tokenHash", "previousTokenHash", "userId", "expiresAt" FROM "RefreshToken" WHERE id = ${existing.id} FOR UPDATE`;
        const row = rows[0];

        if (!row) {
          return { kind: 'invalid' };
        }

        if (row.previousTokenHash === presentedHash) {
          await tx.refreshToken.delete({ where: { id: row.id } });
          return { kind: 'reuse' };
        }

        if (row.tokenHash !== presentedHash) {
          // Matched neither slot under the lock (a concurrent request
          // already rotated past both generations) — nothing safe to act on.
          return { kind: 'invalid' };
        }

        if (row.expiresAt.getTime() < Date.now()) {
          await tx.refreshToken.delete({ where: { id: row.id } });
          return { kind: 'expired' };
        }

        const rawRefreshToken = generateOpaqueToken();
        await tx.refreshToken.update({
          where: { id: row.id },
          data: {
            previousTokenHash: row.tokenHash,
            tokenHash: hashOpaqueToken(rawRefreshToken),
            expiresAt: refreshTokenExpiry(),
          },
        });

        const user = await tx.user.findUniqueOrThrow({
          where: { id: row.userId },
        });
        const authUser: AuthenticatedUser = {
          id: user.id,
          email: user.email,
          role: user.role,
        };

        return {
          kind: 'success',
          accessToken: await this.jwtService.signAsync({
            sub: user.id,
            email: user.email,
            role: user.role,
          }),
          refreshToken: rawRefreshToken,
          user: authUser,
        };
      },
    );

    switch (outcome.kind) {
      case 'reuse':
        throw new AppException(
          AUTH_ERROR_CODES.REFRESH_TOKEN_REUSE_DETECTED,
          'Refresh token reuse detected',
          HttpStatus.UNAUTHORIZED,
        );
      case 'expired':
        throw new AppException(
          AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED,
          'Refresh token expired',
          HttpStatus.UNAUTHORIZED,
        );
      case 'invalid':
        throw new AppException(
          AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
          'Invalid refresh token',
          HttpStatus.UNAUTHORIZED,
        );
      case 'success':
        return outcome;
    }
  }

  async logout(presentedToken: string | undefined): Promise<void> {
    if (!presentedToken) {
      return;
    }
    const presentedHash = hashOpaqueToken(presentedToken);
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { tokenHash: presentedHash },
          { previousTokenHash: presentedHash },
        ],
      },
    });
  }

  async getCurrentUser(userId: string): Promise<CurrentUserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppException(
        AUTH_ERROR_CODES.SESSION_USER_NOT_FOUND,
        'User no longer exists',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  /** Returns the raw reset token when the email matches a user, null otherwise. */
  async requestPasswordReset(email: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    const rawToken = generateOpaqueToken();
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashOpaqueToken(rawToken),
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000,
        ),
      },
    });

    return rawToken;
  }

  async confirmPasswordReset(
    rawToken: string,
    newPassword: string,
  ): Promise<void> {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashOpaqueToken(rawToken) },
    });

    if (
      !resetToken ||
      resetToken.usedAt ||
      resetToken.expiresAt.getTime() < Date.now()
    ) {
      throw new AppException(
        AUTH_ERROR_CODES.INVALID_RESET_TOKEN,
        'Invalid or expired reset token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordHash = await argon2.hash(newPassword);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);
  }
}
