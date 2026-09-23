import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role } from '@generated/prisma/enums.js';
import { AppException } from '@common/errors/app.exception.js';
import { COMMON_ERROR_CODES } from '@common/errors/error-codes.js';
import { ROLES_KEY } from '@common/decorators/roles.decorator.js';

/**
 * Runs after the global JwtAuthGuard, which has already populated
 * request.user by the time this executes. A route with no @Roles() decorator
 * is left alone — this guard only restricts routes that opt in.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const role = request.user?.role;
    if (!role || !requiredRoles.includes(role)) {
      throw new AppException(
        COMMON_ERROR_CODES.FORBIDDEN,
        'You do not have permission to perform this action',
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }
}
