/**
 * Central error code registry. Each domain owns a numeric block; add new
 * domains as new exported consts rather than reusing another domain's range.
 *
 *   1000-1999  auth
 *   9000-9999  common / cross-cutting (validation, unmapped, internal)
 */

export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 1000,
  MISSING_ACCESS_TOKEN: 1001,
  INVALID_ACCESS_TOKEN: 1002,
  MISSING_REFRESH_TOKEN: 1003,
  INVALID_REFRESH_TOKEN: 1004,
  REFRESH_TOKEN_REUSE_DETECTED: 1005,
  REFRESH_TOKEN_EXPIRED: 1006,
  SESSION_USER_NOT_FOUND: 1007,
  INVALID_RESET_TOKEN: 1008,
} as const;

export const COMMON_ERROR_CODES = {
  VALIDATION_FAILED: 9000,
  RATE_LIMITED: 9001,
  UNMAPPED_ERROR: 9998,
  INTERNAL_ERROR: 9999,
} as const;
