import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuctionCategoryService } from './auction-category.service';
import { CreateAuctionCategoryDto } from './dto/create-auction-category.dto';
import { UpdateAuctionCategoryDto } from './dto/update-auction-category.dto';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('/admin/auction-categories')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles('ADMIN')
export class AdminAuctionCategoryController {
  constructor(private readonly categoryService: AuctionCategoryService) {}

  @Post()
  create(@Body() dto: CreateAuctionCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuctionCategoryDto) {
    return this.categoryService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
