import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { AppException } from '@common/errors/app.exception.js';
import { AUTH_ERROR_CODES } from '@common/errors/error-codes.js';
import { ErrorResponseDto } from '@common/dto/error-response.dto.js';
import {
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_PATH,
} from './auth.constants.js';
import { clearAuthCookies, setAuthCookies } from './cookie.util.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import { Public } from './decorators/public.decorator.js';
import { LoginDto } from './dto/login.dto.js';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto.js';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto.js';
import { PasswordResetRequestResponseDto } from './dto/password-reset-request-response.dto.js';
import { SessionResponseDto } from './dto/session-response.dto.js';
import { SuccessResponseDto } from './dto/success-response.dto.js';
import { UpdateMeDto } from './dto/update-me.dto.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import type { AuthenticatedUser } from './interfaces/jwt-payload.interface.js';

@ApiTags('auth')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Log in with email and password',
    description:
      'On success, sets the `access_token` (15 min, path `/`) and `refresh_token` ' +
      `(24h, path \`${REFRESH_TOKEN_PATH}\`) cookies — both httpOnly, Secure, SameSite=None. ` +
      'Neither token is ever present in the response body.',
  })
  @ApiOkResponse({ type: SessionResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponseDto> {
    const { accessToken, refreshToken, user } = await this.authService.login(
      dto.email,
      dto.password,
    );
    setAuthCookies(res, { accessToken, refreshToken });
    return { user };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate the refresh token and issue a new access token',
    description:
      'Reads the `refresh_token` cookie (browsers only send it here, since the ' +
      'cookie is path-scoped to this route). Reuse of an already-rotated token ' +
      'revokes the whole session (code ' +
      AUTH_ERROR_CODES.REFRESH_TOKEN_REUSE_DETECTED +
      ') — the theft-detection signal.',
  })
  @ApiOkResponse({ type: SessionResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SessionResponseDto> {
    const presented = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!presented) {
      throw new AppException(
        AUTH_ERROR_CODES.MISSING_REFRESH_TOKEN,
        'Missing refresh token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { accessToken, refreshToken, user } =
      await this.authService.refresh(presented);
    setAuthCookies(res, { accessToken, refreshToken });
    return { user };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke the current session and clear auth cookies',
    description:
      'Idempotent — safe to call with no session at all; always clears cookies.',
  })
  @ApiOkResponse({ type: SuccessResponseDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<SuccessResponseDto> {
    const presented = req.cookies?.[REFRESH_TOKEN_COOKIE];
    await this.authService.logout(presented);
    clearAuthCookies(res);
    return { success: true };
  }

  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    return this.authService.getCurrentUser(user.id);
  }

  @Patch('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Update basic account info for the current user',
    description:
      'firstName/lastName only, for any role. Email is unchangeable here; ' +
      'CANDIDATE-only fields (phone, skills, etc.) go through ' +
      'PATCH /users/candidates/:id instead.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateMeDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateCurrentUser(user.id, dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request a password reset',
    description:
      'Always returns a generic success message, whether or not the email ' +
      'matches an account, to avoid user enumeration.',
  })
  @ApiOkResponse({ type: PasswordResetRequestResponseDto })
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
  ): Promise<PasswordResetRequestResponseDto> {
    const rawToken = await this.authService.requestPasswordReset(dto.email);
    const response: PasswordResetRequestResponseDto = {
      message:
        'If an account exists for this email, a reset link has been sent.',
    };
    if (rawToken && process.env.NODE_ENV !== 'production') {
      response.resetToken = rawToken;
    }
    return response;
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm a password reset',
    description: 'Also revokes any existing session for the user.',
  })
  @ApiOkResponse({ type: SuccessResponseDto })
  async confirmPasswordReset(
    @Body() dto: PasswordResetConfirmDto,
  ): Promise<SuccessResponseDto> {
    await this.authService.confirmPasswordReset(dto.token, dto.newPassword);
    return { success: true };
  }
}
