import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors();
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
    .addTag('availability')
    .addTag('cart')
    .addTag('bookings')
    .addTag('payments')
    .addTag('coupons')
    .addTag('reviews')
    .addTag('settlements')
    .addTag('uploads')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(config.get<string>('SWAGGER_PATH', 'docs'), app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(config.get<number>('PORT', 4000));
}

void bootstrap();
