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
import { AddAuctionImageDto } from './dto/add-auction-image.dto';
import { UpdateAuctionImageDto } from './dto/update-auction-image.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('/admin')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminAuctionImageController {
  constructor(private readonly imageService: AuctionImageService) {}

  @Post('auctions/:auctionId/images')
  addImage(
    @Param('auctionId') auctionId: string,
    @Body() dto: AddAuctionImageDto,
    @Req() req: any,
  ) {
    return this.imageService.addImage(
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

  @Post('auction-images/:imageId/set-primary')
  setPrimary(@Param('imageId') imageId: string, @Req() req: any) {
    return this.imageService.setPrimary(imageId, req.user.id, req.user.roles);
  }

  @Delete('auction-images/:imageId')
  removeImage(@Param('imageId') imageId: string, @Req() req: any) {
    return this.imageService.removeImage(imageId, req.user.id, req.user.roles);
  }
}
