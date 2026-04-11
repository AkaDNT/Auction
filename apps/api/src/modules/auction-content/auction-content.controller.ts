import { Controller, Get, Query } from '@nestjs/common';
import { AuctionContentService } from './auction-content.service';

@Controller()
export class AuctionContentController {
  constructor(private readonly contentService: AuctionContentService) {}

  @Get('auction-features')
  getFeatures(@Query('isActive') isActive?: string) {
    return this.contentService.getFeatures(
      isActive === undefined ? true : isActive === 'true',
    );
  }

  @Get('auction-faqs')
  getFaqs(@Query('isActive') isActive?: string) {
    return this.contentService.getFaqs(
      isActive === undefined ? true : isActive === 'true',
    );
  }
}
