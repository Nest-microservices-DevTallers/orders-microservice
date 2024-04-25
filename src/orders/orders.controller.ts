import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

import { OrdersService } from './orders.service';
import {
  OrderPaginationDto,
  ChangeOrderStatus,
  CreateOrderDto,
  PaidOrderDto,
} from './dto';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @MessagePattern('createOrder')
  async create(@Payload() createOrderDto: CreateOrderDto) {
    const order = await this.ordersService.create(createOrderDto);

    const paymentSession = await this.ordersService.createPaymentSession(order);

    return {
      order,
      paymentSession,
    };
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

  @EventPattern('payment.succeedeed')
  paidOrder(@Payload() paidOrderDto: PaidOrderDto) {
    this.ordersService.paidOrder(paidOrderDto);
  }
}
