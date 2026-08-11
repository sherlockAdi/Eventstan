import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const bodyLimit = config.get<string>('BODY_LIMIT', '25mb');

  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

  const configuredOrigins = config
    .get<string>('CORS_ORIGINS', '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: configuredOrigins.length ? configuredOrigins : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    credentials: true,
  });
  app.setGlobalPrefix(config.get<string>('API_PREFIX', 'api/v1'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('EventStan API')
    .setDescription('Backend API for EventStan v1 multi-vendor event marketplace.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .addTag('health')
    .addTag('auth')
    .addTag('master-data')
    .addTag('vendors')
    .addTag('services')
    .addTag('packages')
    .addTag('blogs')
    .addTag('availability')
    .addTag('cart')
    .addTag('bookings')
    .addTag('customer')
    .addTag('payments')
    .addTag('coupons')
    .addTag('reviews')
    .addTag('user-leads')
    .addTag('vendor-leads')
    .addTag('settlements')
    .addTag('support')
    .addTag('uploads')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(config.get<string>('SWAGGER_PATH', 'docs'), app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(config.get<number>('PORT', 4000));
}

void bootstrap();
