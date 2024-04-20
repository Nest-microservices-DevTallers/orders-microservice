import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

import { ChangeOrderStatus, CreateOrderDto, OrderPaginationDto } from './dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  create(@Payload() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @MessagePattern('findAllOrders')
  findAll(@Payload() orderPaginationDto: OrderPaginationDto) {
    return this.ordersService.findAll(orderPaginationDto);
  }

  @MessagePattern('findOneOrder')
  findOne(@Payload() id: string) {
    return this.ordersService.findOne(id);
  }

  @MessagePattern('changeOrderStatus')
  changeOrderStatus(@Payload() changeOrderStatus: ChangeOrderStatus) {
    const { id, status } = changeOrderStatus;

    return this.ordersService.changeStatus(id, status);
  }
}
