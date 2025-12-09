import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.use(json({ limit: '10mb' }));

  const config = new DocumentBuilder()
    .setTitle('LegalPlus API')
    .setDescription('API documentation for LegalPlus backend')
    .setVersion('1.0.0')
    .addBearerAuth() // optional: enable JWT auth on Swagger UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document); // http://localhost:3000/api/docs

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`LegalPlus API running on http://localhost:${port}`);
  console.log(`Swagger Docs available at http://localhost:${port}/docs`);
}

bootstrap();
