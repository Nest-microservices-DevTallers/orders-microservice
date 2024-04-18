import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { envs } from './config';

async function bootstrap() {
  const logger = new Logger('OrdersBoostrap');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        port: envs.port,
      },
    },
  );

  await app.listen();
  logger.log(`🚀 Orders microdervice running on port ${envs.port}`);
}
bootstrap();
