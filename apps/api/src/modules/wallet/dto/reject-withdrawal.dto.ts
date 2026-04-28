import { IsString, MinLength } from 'class-validator';

export class RejectWithdrawalDto {
  @IsString()
  @MinLength(1)
  reason!: string;
}
