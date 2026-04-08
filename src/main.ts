import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/api.response.interceptor';


/**
 * Bootstrap function to initialize the NestJS application, set up global validation and response formatting, and start the server on the specified port.
 */

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enforce DTO validation for auth requests.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());

  const portRaw = process.env.PORT?.trim();
  const port = Number(portRaw);

  if (!portRaw || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be set to a valid integer between 1 and 65535');
  }

  await app.listen(port);
}
bootstrap();
