import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AppException } from '../errors/app.exception';
import { ERROR_CODES } from '@repo/shared';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest();
    const user = req.user as { id: string; roles?: string[] } | undefined;

    const hasRole =
      !!user &&
      Array.isArray(user.roles) &&
      user.roles.some((role) => requiredRoles.includes(role));

    if (!hasRole) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_FORBIDDEN,
          message: 'Không có quyền truy cập',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    return true;
  }
}
