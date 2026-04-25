import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import type { Response } from 'express';

import { RegisterDto } from './dto/register.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { AppException } from 'src/common/errors/app.exception';
import { ERROR_CODES } from '@repo/shared';

@Controller('auth')
export class AuthController {
  private readonly refreshTokenCookieName = 'refresh_token';

  constructor(private readonly authService: AuthService) {}

  private setRefreshCookie(res: Response, token: string) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS || 7);
    const secure = (process.env.COOKIE_SECURE ?? 'false') === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none';

    res.cookie(this.refreshTokenCookieName, token, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: days * 24 * 3600 * 1000,
      path: '/auth',
    });
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(this.refreshTokenCookieName, { path: '/auth' });
  }

  @Post('/login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(body.email, body.password);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('/register')
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(body);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rt = (req as any).cookies?.[this.refreshTokenCookieName];
    if (!rt) {
      throw new AppException(
        {
          code: ERROR_CODES.AUTH_REFRESH_MISSING,
          message: 'Thiếu refresh token',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    const result = await this.authService.refresh(rt);
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken };
  }

  @Post('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const rt = (req as any).cookies?.[this.refreshTokenCookieName];
    await this.authService.logout(rt);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @UseGuards(JwtAccessGuard)
  @Get('/me')
  async me(@Req() req: any) {
    const user = await this.authService.getMe(req.user.id);
    return { user };
  }
}
