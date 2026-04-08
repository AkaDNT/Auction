import { HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppException } from '../errors/app.exception';
import { ERROR_CODES } from '@repo/shared';

@Injectable()
export class JwtAccessGuard extends AuthGuard('jwt-access') {
  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_UNAUTHORIZED,
          message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
}
