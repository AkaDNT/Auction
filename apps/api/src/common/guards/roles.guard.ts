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

  canActivate(ctx: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles || roles.length === 0) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !roles.includes(user.role)) {
      throw new AppException(
        { code: ERROR_CODES.AUTH_FORBIDDEN, message: 'Forbidden' },
        HttpStatus.FORBIDDEN,
      );
    }
    return user && roles.includes(user.role);
  }
}
