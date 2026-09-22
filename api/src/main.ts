import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

function loadDevHttpsOptions() {
  if (process.env.NODE_ENV === 'production') {
    return undefined;
  }

  const keyPath = join(process.cwd(), 'certs', 'localhost-key.pem');
  const certPath = join(process.cwd(), 'certs', 'localhost-cert.pem');

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    console.warn(
      '[main] No local TLS cert found at certs/ — falling back to HTTP. ' +
        'Cookies with SameSite=None require HTTPS; run `mkcert -install && ' +
        'mkcert -key-file certs/localhost-key.pem -cert-file certs/localhost-cert.pem localhost 127.0.0.1 ::1` to enable it.',
    );
    return undefined;
  }

  return {
    key: readFileSync(keyPath),
    cert: readFileSync(certPath),
  };
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    httpsOptions: loadDevHttpsOptions(),
  });

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:4200',
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Intervivo API')
      .setDescription(
        'Every error response is { statusCode, code, message } — the UI keys ' +
          'off `code` (see the error-codes registry in src/common/errors), ' +
          '`message` is for developers only.',
      )
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
