import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json } from 'express';
import { AppModule } from './app.module';
import { buildProxyMiddlewares } from './proxy/proxy.factory';
import { JwtVerifyService } from './auth/jwt-verify.service';

async function bootstrap() {
  // bodyParser deshabilitado: los proxys requieren el stream crudo;
  // el parser se aplica manualmente a las rutas propias.
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const config = app.get(ConfigService);
  const jwtVerify = app.get(JwtVerifyService);

  const rawOrigins = config.get<string>('CORS_ORIGINS');
  const corsOrigin =
    !rawOrigins || rawOrigins.trim() === '*'
      ? true
      : (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
          cb(null, true);
        };
  app.enableCors({ origin: corsOrigin, credentials: true });

  const express = app.getHttpAdapter().getInstance();
  // Body parser para rutas propias: auth + dominio local (quotations/payments)
  // /graphql incluido: la matriz de roles inspecciona query vs mutation;
  // fixRequestBody (proxyReq) lo re-serializa al proxear.
  express.use(
    [
      '/auth',
      '/health',
      '/api/auth',
      '/api/quotations',
      '/api/payments',
      '/api/products',
      '/api/uploads',
      '/graphql',
    ],
    json({ limit: '15mb' }),
  );

  // Proxys: /graphql + /subscriptions → business (Java), /api/ai → ai (Python),
  // /api/invoices → billing (PHP). quotations/payments son locales (mismo NestJS).
  for (const mw of buildProxyMiddlewares(config, jwtVerify)) {
    express.use(mw.path, mw.middleware);
  }

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port, '0.0.0.0');
  new Logger('Gateway').log(`API Gateway + Cotizaciones/Pagos escuchando en :${port}`);
}

bootstrap();
