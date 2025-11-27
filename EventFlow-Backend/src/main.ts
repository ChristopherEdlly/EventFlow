import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser (required for JWT authentication)
  app.use(cookieParser());

  // Check if running behind proxy (nginx in production)
  const isBehindProxy = process.env.NODE_ENV === 'production';

  // Security - Helmet with CORS-friendly settings
  if (!isBehindProxy) {
    // Only use helmet in development (nginx handles security in production)
    app.use(
      helmet({
        crossOriginResourcePolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );
  }

  // Rate limiting - More permissive for development
  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute
      max: 1000, // limit each IP to 1000 requests per minute (very permissive)
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // CORS Configuration - Always enable to avoid intermittent issues
  app.enableCors({
    origin: true, // Libera todas as origens para desenvolvimento
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['set-cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  console.log('CORS liberado para todas as origens (dev)');

  // Global filters and interceptors
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
