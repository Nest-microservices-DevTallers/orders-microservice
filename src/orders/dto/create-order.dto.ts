import { OrderStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsPositive,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  IsEnum,
} from 'class-validator';

export class CreateOrderDto {
  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  totalAmount: number;

  @Type(() => Number)
  @IsPositive()
  @IsNumber()
  totalItems: number;

  @IsEnum(OrderStatus, {
    message: `Possible status values ate ${OrderStatus}`,
  })
  @IsOptional()
  @IsString()
  status: OrderStatus = OrderStatus.PENDING;

  @IsOptional()
  @IsBoolean()
  paid: boolean = false;
}
