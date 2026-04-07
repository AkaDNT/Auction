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
import { AuctionService } from './auction.service';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { UpdateAuctionDto } from './dto/update-auction.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@repo/db';

@Controller('/seller/auctions')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.SELLER, Role.ADMIN)
export class SellerAuctionController {
  constructor(private readonly auctionService: AuctionService) {}

  @Post()
  create(@Body() dto: CreateAuctionDto, @Req() req: any) {
    return this.auctionService.create(dto, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAuctionDto,
    @Req() req: any,
  ) {
    return this.auctionService.update(id, req.user.id, dto);
  }

  @Post(':id/publish')
  publish(@Param('id') id: string, @Req() req: any) {
    return this.auctionService.publish(id, req.user.id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.auctionService.cancel(id, req.user.id, req.role);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.auctionService.remove(id, req.user.id);
  }
}
