import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@repo/db';
import { UploadAssetService } from '../upload-asset/upload-asset.service';
import { CreateUploadUrlDto } from '../upload-asset/dto/create-upload-url.dto';
import { ConfirmUploadAssetDto } from '../upload-asset/dto/confirm-upload-asset.dto';

@Controller('/seller/uploads')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.SELLER, Role.ADMIN)
export class SellerUploadAssetController {
  constructor(private readonly uploadAssetService: UploadAssetService) {}

  @Post('upload-url')
  createUploadUrl(@Body() dto: CreateUploadUrlDto, @Req() req: any) {
    return this.uploadAssetService.createUploadUrl(dto, req.user.id);
  }

  @Post('confirm')
  confirmUpload(@Body() dto: ConfirmUploadAssetDto, @Req() req: any) {
    return this.uploadAssetService.confirmUpload(dto, req.user.id);
  }
}
