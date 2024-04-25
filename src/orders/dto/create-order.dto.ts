import { Type } from 'class-transformer';
import { ValidateNested, ArrayMinSize, IsArray } from 'class-validator';

import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1)
  @IsArray()
  items: OrderItemDto[];
  // @Type(() => Number)
  // @IsPositive()
  // @IsNumber()
  // totalAmount: number;

  // @Type(() => Number)
  // @IsPositive()
  // @IsNumber()
  // totalItems: number;

  // @IsEnum(OrderStatus, {
  //   message: `Possible status values ate ${OrderStatus}`,
  // })
  // @IsOptional()
  // @IsString()
  // status: OrderStatus = OrderStatus.PENDING;

  // @IsOptional()
  // @IsBoolean()
  // paid: boolean = false;
}
