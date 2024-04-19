import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';

import { CreateOrderDto, OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('🚀 Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    return await this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const { page, limit, status } = orderPaginationDto;

    const totalPages = await this.order.count({ where: { status } });
    const lastPage = Math.ceil(totalPages / limit);

    const data = await this.order.findMany({
      where: { status },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        total: totalPages,
        page,
        lastPage,
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: { id },
    });

    if (!order)
      throw new RpcException({
        message: `Not found product with id #${id}`,
        status: HttpStatus.NOT_FOUND,
      });

    return order;
  }

  async changeStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);

    if (order.status === status) return order

    return await this.order.update({
      where: { id },
      data: {
        status,
      },
    });
  }
}
