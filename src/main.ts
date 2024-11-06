import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as process from 'node:process';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { API_VERSION } from './constants/api-version';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./src/cert/localhost.key.pem'),
    cert: fs.readFileSync('./src/cert/localhost.cert.pem'),
  };
  const app = await NestFactory.create(AppModule, { cors: true, snapshot: true, httpsOptions });
  app.setGlobalPrefix(API_VERSION);
  app.useGlobalPipes();
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  const logger = new Logger();
  const config = new DocumentBuilder()
    .setTitle('Budgetify swagger')
    .setDescription('The Budgetify API description')
    .addTag('users')
    .addTag('auth')
    .addTag('categories')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // https://localhost:3000/api
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  }); //  https://localhost:3000/swagger/json
  logger.log(`Application running on port ${process.env.PORT}`);
  await app.listen(process.env.PORT);
}
bootstrap();
