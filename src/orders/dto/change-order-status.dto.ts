import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class ChangeOrderStatus {
  @IsUUID(4)
  id: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
