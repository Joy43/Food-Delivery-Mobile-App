import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { createRouteHandler } from 'uploadthing/express';
import { uploadRouter } from './uploadthing/upload-router';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Configure Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Food Delivery API')
    .setDescription('Food Delivery Application Backend API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name matches the security requirement name in controller decorators
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.enableCors();
  app.setGlobalPrefix('api'); // /api/....
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(
    '/api/uploadthing',
    createRouteHandler({
      router: uploadRouter,
      config: {
        token: process.env.UPLOADTHING_TOKEN!,
      },
    }),
  );

  const port = process.env.PORT ?? 3000;

  await app.listen(port);
  console.log(`API running on port ${port}`);
  console.log(`Backend local URL: http://localhost:${port}/api`);
  console.log(`Swagger docs available at: http://localhost:${port}/docs`);
}
void bootstrap();
