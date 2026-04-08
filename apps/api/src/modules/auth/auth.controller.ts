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
import { UsersService } from './users.service';
import { Role } from '@repo/db';

import { RegisterDto } from './dto/register.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { LoginDto } from './dto/login.dto';
import { AppException } from 'src/common/errors/app.exception';
import { ERROR_CODES } from '@repo/shared';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  private setRefreshCookie(res: Response, token: string) {
    const days = Number(process.env.JWT_REFRESH_TTL_DAYS || 7);
    const secure = (process.env.COOKIE_SECURE ?? 'false') === 'true';
    const sameSite = (process.env.COOKIE_SAMESITE ?? 'lax') as
      | 'lax'
      | 'strict'
      | 'none';
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: days * 24 * 3600 * 1000,
      path: '/auth',
    });
  }

  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create-user')
  async createUser(@Body() body: { email: string; password: string }) {
    const user = await this.usersService.createUser(body.email, body.password);
    return { user };
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
    const rt = (req as any).cookies?.refresh_token;
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
    const rt = (req as any).cookies?.refresh_token;
    await this.authService.logout(rt);
    res.clearCookie('refresh_token', { path: '/auth' });
    return { ok: true };
  }

  @UseGuards(JwtAccessGuard)
  @Get('/me')
  me(@Req() req: any) {
    return { user: req.user };
  }
}
