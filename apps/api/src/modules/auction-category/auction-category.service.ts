import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as auctionCategoryRepository from './auction-category.repository';
import { CreateAuctionCategoryDto } from './dto/create-auction-category.dto';
import { UpdateAuctionCategoryDto } from './dto/update-auction-category.dto';
import { ERROR_CODES } from '@repo/shared';
import { AppException } from 'src/common/errors/app.exception';

@Injectable()
export class AuctionCategoryService {
  constructor(
    @Inject(auctionCategoryRepository.AUCTION_CATEGORY_REPOSITORY)
    private readonly categoryRepo: auctionCategoryRepository.IAuctionCategoryRepository,
  ) {}

  async create(dto: CreateAuctionCategoryDto) {
    const existed = await this.categoryRepo.findBySlug(dto.slug);

    if (existed) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_CATEGORY_SLUG_ALREADY_EXISTS,
          message: 'Slug danh mục đã tồn tại',
          details: { slug: dto.slug },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.categoryRepo.create({
      slug: dto.slug,
      label: dto.label,
      description: dto.description ?? null,
    });
  }

  async findAll() {
    return this.categoryRepo.findAll();
  }

  async findOneBySlug(slug: string) {
    const category = await this.categoryRepo.findBySlug(slug);

    if (!category) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_CATEGORY_NOT_FOUND,
          message: 'Không tìm thấy danh mục đấu giá',
          details: { slug },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }

  async update(id: string, dto: UpdateAuctionCategoryDto) {
    const current = await this.categoryRepo.findById(id);

    if (!current) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_CATEGORY_NOT_FOUND,
          message: 'Không tìm thấy danh mục đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (dto.slug && dto.slug !== current.slug) {
      const existed = await this.categoryRepo.findBySlug(dto.slug);

      if (existed) {
        throw new AppException(
          {
            code: ERROR_CODES.AUCTION_CATEGORY_SLUG_ALREADY_EXISTS,
            message: 'Slug danh mục đã tồn tại',
            details: { slug: dto.slug },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.categoryRepo.update(id, {
      slug: dto.slug,
      label: dto.label,
      description: dto.description,
    });
  }

  async remove(id: string) {
    const current = await this.categoryRepo.findById(id);

    if (!current) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_CATEGORY_NOT_FOUND,
          message: 'Không tìm thấy danh mục đấu giá',
          details: { id },
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const auctionsCount = await this.categoryRepo.countAuctions(id);

    if (auctionsCount > 0) {
      throw new AppException(
        {
          code: ERROR_CODES.AUCTION_CATEGORY_IN_USE,
          message: 'Không thể xóa danh mục vì đang có phiên đấu giá sử dụng',
          details: { id, auctionsCount },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.categoryRepo.delete(id);
  }
}
