import {
  Body,
  Controller,
  Patch,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuctionContentService } from './auction-content.service';
import { CreateAuctionFeatureDto } from './dto/create-auction-feature.dto';
import { UpdateAuctionFeatureDto } from './dto/update-auction-feature.dto';
import { CreateAuctionFaqDto } from './dto/create-auction-faq.dto';
import { UpdateAuctionFaqDto } from './dto/update-auction-faq.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from '@repo/db';

@Controller('/admin')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminAuctionContentController {
  constructor(private readonly contentService: AuctionContentService) {}

  @Post('auction-features')
  createFeature(@Body() dto: CreateAuctionFeatureDto) {
    return this.contentService.createFeature(dto);
  }

  @Patch('auction-features/:id')
  updateFeature(@Param('id') id: string, @Body() dto: UpdateAuctionFeatureDto) {
    return this.contentService.updateFeature(id, dto);
  }

  @Post('auction-faqs')
  createFaq(@Body() dto: CreateAuctionFaqDto) {
    return this.contentService.createFaq(dto);
  }

  @Patch('auction-faqs/:id')
  updateFaq(@Param('id') id: string, @Body() dto: UpdateAuctionFaqDto) {
    return this.contentService.updateFaq(id, dto);
  }
}
