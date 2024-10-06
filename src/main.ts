import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.useGlobalPipes();
  const logger = new Logger();
  const config = new DocumentBuilder()
    .setTitle('Budgetify swagger')
    .setDescription('The Budgetify API description')
    .addTag('users')
    .addTag('auth')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // http://localhost:3000/api
  SwaggerModule.setup('swagger', app, document, {
    jsonDocumentUrl: 'swagger/json',
  }); //  http://localhost:3000/swagger/json
  logger.log(`Application running on port ${process.env.PORT}`);
  await app.listen(process.env.PORT);
}
bootstrap();
