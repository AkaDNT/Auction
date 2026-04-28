import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
import { WithdrawalRequestService } from '../services/withdrawal-request.service';
import { CreateWithdrawalRequestDto } from '../dto/create-withdrawal-request.dto';

@Controller('wallet/withdrawals')
@UseGuards(JwtAccessGuard)
export class WalletWithdrawalController {
  constructor(
    private readonly withdrawalRequestService: WithdrawalRequestService,
  ) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateWithdrawalRequestDto) {
    return this.withdrawalRequestService.create(req.user.id, dto);
  }

  @Get()
  findMine(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.withdrawalRequestService.findMyRequests(
      req.user.id,
      Number(page || 1),
      Number(limit || 20),
    );
  }
}
