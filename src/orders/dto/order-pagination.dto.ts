import { IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '@prisma/client';

import { PaginationDto } from '@common/dto';

export class OrderPaginationDto extends PaginationDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status: OrderStatus;
}
