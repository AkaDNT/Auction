import { Inject, Injectable, HttpStatus } from '@nestjs/common';
import * as auctionContentRepository from './auction-content.repository';
import { CreateAuctionFeatureDto } from './dto/create-auction-feature.dto';
import { UpdateAuctionFeatureDto } from './dto/update-auction-feature.dto';
import { CreateAuctionFaqDto } from './dto/create-auction-faq.dto';
import { UpdateAuctionFaqDto } from './dto/update-auction-faq.dto';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';

@Injectable()
export class AuctionContentService {
  constructor(
    @Inject(auctionContentRepository.AUCTION_CONTENT_REPOSITORY)
    private readonly contentRepo: auctionContentRepository.IAuctionContentRepository,
  ) {}

  getFeatures(isActive = true) {
    return this.contentRepo.findAllFeatures(isActive);
  }

  getFaqs(isActive = true) {
    return this.contentRepo.findAllFaqs(isActive);
  }

  createFeature(dto: CreateAuctionFeatureDto) {
    return this.contentRepo.createFeature(dto);
  }

  async updateFeature(id: string, dto: UpdateAuctionFeatureDto) {
    const feature = await this.contentRepo.findFeatureById(id);

    if (!feature) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_FEATURE_NOT_FOUND,
          message: 'Không tìm thấy tính năng đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.contentRepo.updateFeature(id, dto);
  }

  createFaq(dto: CreateAuctionFaqDto) {
    return this.contentRepo.createFaq(dto);
  }

  async updateFaq(id: string, dto: UpdateAuctionFaqDto) {
    const faq = await this.contentRepo.findFaqById(id);

    if (!faq) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_FAQ_NOT_FOUND,
          message: 'Không tìm thấy FAQ đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.contentRepo.updateFaq(id, dto);
  }
}
