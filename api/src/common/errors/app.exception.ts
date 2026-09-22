import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionBody {
  code: number;
  message: string;
}

/**
 * Base exception for every error we throw deliberately. Carries a stable
 * numeric `code` (see error-codes.ts) alongside the dev-facing `message` —
 * the UI is expected to key off `code`, never parse `message`.
 */
export class AppException extends HttpException {
  constructor(
    code: number,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}
