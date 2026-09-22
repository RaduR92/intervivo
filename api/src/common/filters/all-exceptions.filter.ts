import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { COMMON_ERROR_CODES } from '@common/errors/error-codes.js';
import { AppException, type AppExceptionBody } from '@common/errors/app.exception.js';

interface ErrorResponseBody {
  statusCode: number;
  code: number;
  message: string;
}

function isAppExceptionBody(body: unknown): body is AppExceptionBody {
  return (
    typeof body === 'object' &&
    body !== null &&
    'code' in body &&
    'message' in body
  );
}

/**
 * Normalizes every thrown error into { statusCode, code, message }. `code`
 * is what the UI keys off to pick a localized message; `message` is for
 * developers only (logs, network tab), never rendered directly.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AppException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const { code, message } = isAppExceptionBody(body)
        ? body
        : { code: COMMON_ERROR_CODES.UNMAPPED_ERROR, message: exception.message };
      response.status(status).json({ statusCode: status, code, message } satisfies ErrorResponseBody);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const rawMessage =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
      const message = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : rawMessage;
      const code =
        status === HttpStatus.BAD_REQUEST
          ? COMMON_ERROR_CODES.VALIDATION_FAILED
          : COMMON_ERROR_CODES.UNMAPPED_ERROR;
      response.status(status).json({ statusCode: status, code, message } satisfies ErrorResponseBody);
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: COMMON_ERROR_CODES.INTERNAL_ERROR,
      message: 'Internal server error',
    } satisfies ErrorResponseBody);
  }
}
