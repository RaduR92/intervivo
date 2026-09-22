import type { Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_PATH,
  REFRESH_TOKEN_TTL_HOURS,
} from './auth.constants.js';

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS * 1000,
  });
  res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: REFRESH_TOKEN_PATH,
    maxAge: REFRESH_TOKEN_TTL_HOURS * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: REFRESH_TOKEN_PATH,
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
}
