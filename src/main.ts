import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as dotenv from 'dotenv';
import * as path from 'path';

if (!process.env.NODE_ENV) throw new Error('No NODE_ENV');
dotenv.config({
  path: path.resolve(`.env.${process.env.NODE_ENV}`),
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
