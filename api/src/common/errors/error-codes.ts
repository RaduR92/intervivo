/**
 * Central error code registry. Each domain owns a numeric block; add new
 * domains as new exported consts rather than reusing another domain's range.
 *
 *   1000-1999  auth
 *   2000-2999  users / candidates
 *   3000-3999  interviews
 *   4000-4999  feedback
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

export const USERS_ERROR_CODES = {
  EMAIL_ALREADY_EXISTS: 2000,
  CANDIDATE_NOT_FOUND: 2001,
} as const;

export const INTERVIEWS_ERROR_CODES = {
  SESSION_NOT_FOUND: 3000,
  INVALID_CANDIDATE: 3001,
  INVALID_INTERVIEWER: 3002,
} as const;

export const FEEDBACK_ERROR_CODES = {
  FEEDBACK_NOT_FOUND: 4000,
  SESSION_NOT_FOUND: 4001,
  FEEDBACK_ALREADY_EXISTS: 4002,
} as const;

export const COMMON_ERROR_CODES = {
  VALIDATION_FAILED: 9000,
  RATE_LIMITED: 9001,
  FORBIDDEN: 9002,
  UNMAPPED_ERROR: 9998,
  INTERNAL_ERROR: 9999,
} as const;
