import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AppException } from '@common/errors/app.exception.js';
import { AUTH_ERROR_CODES } from '@common/errors/error-codes.js';
import { ACCESS_TOKEN_COOKIE } from '@auth/auth.constants.js';
import { IS_PUBLIC_KEY } from '@auth/decorators/public.decorator.js';
import type { JwtPayload } from '@auth/interfaces/jwt-payload.interface.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.[ACCESS_TOKEN_COOKIE];

    if (!token) {
      throw new AppException(
        AUTH_ERROR_CODES.MISSING_ACCESS_TOKEN,
        'Missing access token',
        HttpStatus.UNAUTHORIZED,
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      request.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return true;
    } catch {
      throw new AppException(
        AUTH_ERROR_CODES.INVALID_ACCESS_TOKEN,
        'Invalid or expired access token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
