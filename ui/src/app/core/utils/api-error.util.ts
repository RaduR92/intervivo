import { HttpErrorResponse } from '@angular/common/http';
import { ApiErrorBody } from '@core/models/api-error.model';

/**
 * Maps api/src/common/errors/error-codes.ts's `code` to what the user sees.
 * The backend's own `message` is dev-facing by design (see the API's
 * Swagger description) — this table is the UI's side of that contract, so
 * add an entry here whenever a new error code is meant to reach a user.
 */
const ERROR_MESSAGES: Record<number, string> = {
  // auth (1xxx)
  1000: 'Invalid email or password.',
  1001: 'Your session has expired. Please sign in again.',
  1002: 'Your session has expired. Please sign in again.',
  1003: 'Your session has expired. Please sign in again.',
  1004: 'Your session has expired. Please sign in again.',
  1005: 'Your session was signed out for your security. Please sign in again.',
  1006: 'Your session has expired. Please sign in again.',
  1007: 'Your session is no longer valid. Please sign in again.',
  1008: 'This reset link is invalid or has expired.',
  // users / candidates (2xxx)
  2000: 'A candidate with this email already exists.',
  2001: 'Candidate not found.',
  // interviews (3xxx)
  3000: 'Interview session not found.',
  3001: 'The selected candidate is not valid.',
  3002: 'The selected interviewer is not valid.',
  // feedback (4xxx)
  4000: 'Feedback not found.',
  4001: 'Interview session not found.',
  4002: 'You have already left feedback for this session.',
  // common / cross-cutting (9xxx)
  9000: 'Please check the highlighted fields and try again.',
  9001: 'Too many requests — please slow down and try again shortly.',
  9002: 'You do not have permission to do that.',
  9998: 'Something went wrong. Please try again.',
  9999: 'Something went wrong on our end. Please try again.',
};

const DEFAULT_FALLBACK = 'Something went wrong. Please try again.';

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as ApiErrorBody).code === 'number'
  );
}

/** Extracts a user-facing message from an HTTP error, falling back for anything unmapped or non-API (network failure, etc). */
export function getApiErrorMessage(
  error: unknown,
  fallback: string = DEFAULT_FALLBACK,
): string {
  if (error instanceof HttpErrorResponse && isApiErrorBody(error.error)) {
    return ERROR_MESSAGES[error.error.code] ?? fallback;
  }
  return fallback;
}
