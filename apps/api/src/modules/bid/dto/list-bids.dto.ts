import { Type } from 'class-transformer';
import { Max, Min } from 'class-validator';

export class ListBidsDto {
  @Type(() => Number)
  @Min(1)
  page = 1;

  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit = 20;
}
