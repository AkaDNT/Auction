import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAccessGuard)
export class ProfileController {
  private readonly refreshTokenCookieName = 'refresh_token';

  constructor(private readonly profileService: ProfileService) {}

  private clearRefreshCookie(res: Response) {
    res.clearCookie(this.refreshTokenCookieName, { path: '/auth' });
  }

  @Get('me')
  async getMe(@Req() req: any) {
    const user = await this.profileService.getMe(req.user.id);
    return { user };
  }

  @Patch('me')
  async updateMe(@Req() req: any, @Body() body: UpdateProfileDto) {
    const user = await this.profileService.updateMe(req.user.id, body);
    return { user };
  }

  @Patch('email')
  async updateEmail(@Req() req: any, @Body() body: UpdateEmailDto) {
    const user = await this.profileService.updateEmail(req.user.id, body);
    return { user };
  }

  @Patch('password')
  async changePassword(
    @Req() req: any,
    @Body() body: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.profileService.changePassword(req.user.id, body);
    this.clearRefreshCookie(res);
    return result;
  }
}
