import { Controller, Get, Param } from '@nestjs/common';
import { AuctionCategoryService } from './auction-category.service';

@Controller('auction-categories')
export class AuctionCategoryController {
  constructor(private readonly categoryService: AuctionCategoryService) {}

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoryService.findOneBySlug(slug);
  }
}
