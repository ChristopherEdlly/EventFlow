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

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  // CORS Configuration
  if (isBehindProxy) {
    // In production: Nginx handles CORS, disable NestJS CORS to avoid conflicts
    console.log('Running behind proxy - CORS handled by nginx');
  } else {
    // In development: Enable CORS in NestJS
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:8080',
        process.env.CORS_ORIGIN,
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['set-cookie'],
    });
    console.log('CORS enabled for development');
  }

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
