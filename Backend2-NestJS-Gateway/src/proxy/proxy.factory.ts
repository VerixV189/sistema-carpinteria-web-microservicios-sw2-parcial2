import { ConfigService } from '@nestjs/config';
import { createProxyMiddleware, fixRequestBody, RequestHandler } from 'http-proxy-middleware';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtVerifyService } from '../auth/jwt-verify.service';
import { JwtPayload } from '../auth/auth.service';

export interface MountedProxy {
  path: string;
  middleware: (req: Request, res: Response, next: NextFunction) => void;
}

const PUBLIC_PATHS = ['/auth/login', '/auth/register', '/health'];

/** Rate limit simple para rutas proxeadas (el ThrottlerGuard de Nest no
 * alcanza middleware express): 240 req/min por IP — ventana deslizante. */
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 240;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (list.length >= RATE_LIMIT) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear(); // evita crecimiento sin límite
  return false;
}

/** Headers de identidad que NUNCA pueden venir del cliente: los inyecta el
 * gateway tras validar el JWT. Se borran siempre, incluso en rutas públicas. */
const IDENTITY_HEADERS = ['x-user-id', 'x-user-email', 'x-user-role', 'x-internal-secret'];
function stripIdentityHeaders(req: Request) {
  for (const h of IDENTITY_HEADERS) delete req.headers[h];
}

/** Matriz rol→ruta (auditoría A1). ADMIN accede a todo. */
function forbiddenReason(req: Request, role: string | undefined): string | null {
  if (role === 'ADMIN') return null;
  // req.path es relativo al mount point (express.use) → reconstruir el path real
  const path = `${req.baseUrl ?? ''}${req.path}`;

  // GraphQL gestión: reservado a personal (ADMIN/CARPENTER). El portal del
  // cliente usa REST (/api/quotations, /api/payments, /api/ai) scopiado a su
  // email — un cliente con acceso a /graphql podría listar pedidos y
  // direcciones ajenas.
  if ((path.startsWith('/graphql') || path.startsWith('/subscriptions'))
      && role === 'CLIENT') {
    return 'El portal del cliente no usa la consola de gestión';
  }
  // Reportes/clustering IA (CU7) → ADMIN y CARPENTER (taller)
  if (/^\/api\/ai\/(report|cluster|text-to-sql)/.test(path) && role !== 'CARPENTER') {
    return 'Reportes restringidos a ADMIN/CARPENTER';
  }
  // Crear facturas por REST → ADMIN (el flujo normal lo emite n8n internamente)
  if (path.startsWith('/api/invoices') && req.method === 'POST' && role !== 'CARPENTER') {
    return 'Emisión de facturas restringida';
  }
  return null;
}

function jwtGuard(jwtVerify: JwtVerifyService, internalSecret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    stripIdentityHeaders(req);
    if (rateLimited(req.ip ?? 'unknown')) {
      res.status(429).json({ statusCode: 429, message: 'Demasiadas peticiones' });
      return;
    }
    const fullPath = `${req.baseUrl ?? ''}${req.path}`;
    if (PUBLIC_PATHS.some((p) => fullPath.startsWith(p))) return next();
    const payload = jwtVerify.verify(req.headers.authorization);
    if (!payload) {
      res.status(401).json({ statusCode: 401, message: 'Token JWT requerido o inválido' });
      return;
    }
    const denied = forbiddenReason(req, payload.role);
    if (denied) {
      res.status(403).json({ statusCode: 403, message: denied });
      return;
    }
    // Propagar identidad + secreto de malla (los servicios internos lo exigen)
    req.headers['x-user-id'] = payload.sub;
    req.headers['x-user-email'] = payload.email;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-internal-secret'] = internalSecret;
    next();
  };
}

/**
 * Tabla de routing del Gateway (PDF §API Gateway):
 *   /graphql            → business-service (GraphQL gestión)
 *   /subscriptions (ws) → business-service (GraphQL subscriptions)
 *   /api/ai             → ai-service (REST)
 *   /api/invoices       → billing-service (REST)
 * /api/quotations y /api/payments son locales: este servicio los implementa.
 */
export function buildProxyMiddlewares(config: ConfigService, jwtVerify: JwtVerifyService): MountedProxy[] {
  const logger = new Logger('Proxy');
  const internalSecret = config.get<string>('INTERNAL_SECRET', 'carpinteria-internal-dev');
  const guard = jwtGuard(jwtVerify, internalSecret);

  const mount = (path: string, target: string | undefined, opts: { ws?: boolean; auth?: boolean; prefix?: string } = {}): MountedProxy => {
    const proxy = createProxyMiddleware({
      target: target ?? 'http://localhost:1',
      changeOrigin: true,
      ws: opts.ws ?? false,
      // express.use(path) recorta el prefijo; se restaura antes de proxear
      pathRewrite: (p) => `${opts.prefix ?? path}${p === '/' ? '' : p}`,
      on: {
        // el body ya fue parseado (json() en main.ts) → reescribirlo al proxear
        proxyReq: fixRequestBody,
        error: (err, _req, res) => {
          logger.error(`Proxy ${path} → ${target}: ${err.message}`);
          (res as Response).status?.(502).json({ statusCode: 502, message: 'Servicio no disponible' });
        },
      },
    });
    return {
      path,
      middleware: (req, res, next) => {
        const run = () => proxy(req, res, next);
        if (opts.auth === false) {
          stripIdentityHeaders(req);
          return run();
        }
        guard(req, res, (err?: unknown) => {
          if (err) return next(err);
          if (res.writableEnded) return;
          run();
        });
      },
    };
  };

  return [
    mount('/graphql', config.get('BUSINESS_SERVICE_URL'), { ws: true }),
    mount('/subscriptions', config.get('BUSINESS_SERVICE_URL'), { ws: true }),
    mount('/api/ai', config.get('AI_SERVICE_URL'), { prefix: '/ai' }),
    mount('/api/invoices', config.get('BILLING_SERVICE_URL')),
  ];
}
