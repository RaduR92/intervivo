import { ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { AppException } from '@common/errors/app.exception.js';
import { COMMON_ERROR_CODES } from '@common/errors/error-codes.js';

/**
 * Routes throttling rejections through the same { statusCode, code, message }
 * contract as every other error, instead of @nestjs/throttler's default body.
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override async throwThrottlingException(
    _context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const retryAfterSeconds = Math.ceil(throttlerLimitDetail.timeToExpire);
    throw new AppException(
      COMMON_ERROR_CODES.RATE_LIMITED,
      `Too many requests — try again in ${retryAfterSeconds}s`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
