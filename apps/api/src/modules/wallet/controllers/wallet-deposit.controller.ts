import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CreateDepositOrderDto } from '../dto/create-deposit-order.dto';
import { DepositOrderService } from '../services/deposit-order.service';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';

@Controller('wallet/deposits')
@UseGuards(JwtAccessGuard)
export class WalletDepositController {
  constructor(private readonly depositOrderService: DepositOrderService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateDepositOrderDto) {
    return this.depositOrderService.create(req.user.id, dto);
  }

  @Get()
  findMine(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.depositOrderService.findMyOrders(
      req.user.id,
      Number(page || 1),
      Number(limit || 20),
    );
  }
}
