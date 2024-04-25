import { ClientProxy, RpcException } from '@nestjs/microservices';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import {
  OnModuleInit,
  HttpStatus,
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';

import { NATS_SERVICE } from '@server/config';

import { OrderWithProductsInterface } from './interfaces';
import {
  OrderPaginationDto,
  CreateOrderDto,
  OrderItemDto,
  PaidOrderDto,
} from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('🚀 Database connected');
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const productsIds = createOrderDto.items.map(
        (item: OrderItemDto) => item.productId,
      );

      const products = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productsIds),
      );

      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const price = products.find(
          (product) => product.id === orderItem.productId,
        ).price;

        return acc + price * orderItem.quantity;
      }, 0);

      const totalItems = createOrderDto.items.reduce((acc, orederItem) => {
        return acc + orederItem.quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(
                  (product) => product.id === orderItem.productId,
                ).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find((product) => product.id === orderItem.productId)
            .name,
        })),
      };
    } catch (error) {
      console.log('🚀 ~ OrdersService ~ create ~ error:', error);
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check logs',
      });
    }
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
      include: {
        OrderItem: {
          select: {
            productId: true,
            quantity: true,
            price: true,
          },
        },
      },
    });

    if (!order)
      throw new RpcException({
        message: `Not found product with id #${id}`,
        status: HttpStatus.NOT_FOUND,
      });

    const productsIds = order.OrderItem.map((orderItem) => orderItem.productId);

    const products = await firstValueFrom(
      this.client.send({ cmd: 'validate_products' }, productsIds),
    );

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        name: products.find((product) => product.id === orderItem.productId)
          .name,
      })),
    };
  }

  async changeStatus(id: string, status: OrderStatus) {
    const order = await this.findOne(id);

    if (order.status === status) return order;

    return await this.order.update({
      where: { id },
      data: {
        status,
      },
    });
  }

  async createPaymentSession(order: OrderWithProductsInterface) {
    const paymentSession = await firstValueFrom(
      this.client.send('create.payment.session', {
        orderId: order.id,
        currency: 'usd',
        items: order.OrderItem.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    );

    return paymentSession;
  }

  async paidOrder(paidOrderDto: PaidOrderDto) {
    this.logger.log(paidOrderDto);

    await this.order.update({
      where: {
        id: paidOrderDto.orderId,
      },
      data: {
        status: 'PAID',
        paid: true,
        paidAt: new Date(),
        stripChargeId: paidOrderDto.stripePaymentId,
        OrderReceipt: {
          create: {
            receiptUrl: paidOrderDto.receiptUrl,
          },
        },
      },
    });
  }
}
