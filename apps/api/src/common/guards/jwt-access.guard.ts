import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppException } from '../errors/app.exception';
import { ERROR_CODES } from '@repo/shared';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new AppException(
        { code: ERROR_CODES.AUTH_UNAUTHORIZED, message: 'Unauthorized' },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
