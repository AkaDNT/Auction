import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@repo/db';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { RejectWithdrawalDto } from '../dto/reject-withdrawal.dto';
import { WithdrawalRequestService } from '../services/withdrawal-request.service';
import { JwtAccessGuard } from 'src/common/guards/jwt-access.guard';
@Controller('admin/wallet/withdrawals')
@UseGuards(JwtAccessGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminWalletWithdrawalController {
  constructor(
    private readonly withdrawalRequestService: WithdrawalRequestService,
  ) {}

  @Get('pending')
  findPending(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.withdrawalRequestService.findPending(
      Number(page || 1),
      Number(limit || 20),
    );
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.withdrawalRequestService.complete(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectWithdrawalDto) {
    return this.withdrawalRequestService.reject(id, dto.reason);
  }
}
