import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateWithdrawalRequestDto {
  @IsNumber()
  @Min(1000)
  amount!: number;

  @IsOptional()
  @IsString()
  bankCode?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsString()
  bankAccountNo!: string;

  @IsString()
  bankAccountName!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
