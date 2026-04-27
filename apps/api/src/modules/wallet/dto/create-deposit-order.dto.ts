import { DepositProvider } from '@prisma/client';
import { IsEnum, IsNumber, Min } from 'class-validator';

export class CreateDepositOrderDto {
  @IsEnum(DepositProvider)
  provider!: DepositProvider;

  @IsNumber()
  @Min(1000)
  amount!: number;
}
