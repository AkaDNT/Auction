import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@repo/db';
import { AuctionImageService } from './auction-image.service';
import { UpdateAuctionImageDto } from './dto/update-auction-image.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CreateAuctionImageUploadDto } from './dto/create-auction-image-upload.dto';
import { ConfirmAuctionImageDto } from './dto/confirm-auction-image.dto';

@Controller('/admin')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminAuctionImageController {
  constructor(private readonly imageService: AuctionImageService) {}

  @Post('auctions/:auctionId/images/upload-url')
  createUploadUrl(
    @Param('auctionId') auctionId: string,
    @Body() dto: CreateAuctionImageUploadDto,
    @Req() req: any,
  ) {
    return this.imageService.createUploadUrl(
      auctionId,
      dto,
      req.user.id,
      req.user.roles,
    );
  }

  @Post('auctions/:auctionId/images/confirm')
  confirmUpload(
    @Param('auctionId') auctionId: string,
    @Body() dto: ConfirmAuctionImageDto,
    @Req() req: any,
  ) {
    return this.imageService.confirmUpload(
      auctionId,
      dto,
      req.user.id,
      req.user.roles,
    );
  }

  @Patch('auction-images/:imageId')
  updateImage(
    @Param('imageId') imageId: string,
    @Body() dto: UpdateAuctionImageDto,
    @Req() req: any,
  ) {
    return this.imageService.updateImage(
      imageId,
      dto,
      req.user.id,
      req.user.roles,
    );
  }

  @Patch('auction-images/:imageId/set-primary')
  setPrimary(@Param('imageId') imageId: string, @Req() req: any) {
    return this.imageService.setPrimary(imageId, req.user.id, req.user.roles);
  }

  @Delete('auction-images/:imageId')
  removeImage(@Param('imageId') imageId: string, @Req() req: any) {
    return this.imageService.removeImage(imageId, req.user.id, req.user.roles);
  }
}
