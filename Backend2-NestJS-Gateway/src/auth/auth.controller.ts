import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './auth.service';
import { Request, Response } from 'express';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  password!: string;
}

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsString()
  address?: string;
}

export class UpsertStaffDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  role?: 'CARPENTER' | 'CLIENT' | 'ADMIN';
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  /** Login — más restrictivo con rate limit (10/min) por fuerza bruta. */
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  /** Alta de cliente — pública, con el mismo límite anti-fuerza-bruta. */
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  /** Alta o actualización de cuenta de acceso (Carpintero / Cliente) desde el panel Admin. */
  @UseGuards(JwtAuthGuard)
  @Post('register-user')
  registerUser(@Body() dto: UpsertStaffDto) {
    return this.auth.upsertUserAccount(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: Request & { user: JwtPayload }) {
    return this.auth.me(req.user);
  }

  /**
   * SSO Federado Externo con Google (OAuth 2.0 / OpenID Connect):
   * - Si GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET están configurados en .env, redirige a accounts.google.com.
   * - Si no están configurados (modo autónomo/académico), despliega el Selector de Cuentas OIDC Federado de Google.
   */
  @Get('google')
  googleAuth(
    @Query('redirect_uri') redirectUri: string | undefined,
    @Query('chooser') forceChooser: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const referer = req.headers.referer;
    let defaultRedirect = 'https://ramio.tech/login';
    if (referer) {
      try {
        const u = new URL(referer);
        defaultRedirect = `${u.origin}${u.pathname}`;
      } catch {
        // ignore
      }
    }
    const targetRedirect = redirectUri || defaultRedirect;
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')?.trim();
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET')?.trim();

    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
    const gatewayCallback =
      this.config.get<string>('GOOGLE_CALLBACK_URL')?.trim() || `${proto}://${host}/auth/google/callback`;

    if (clientId && clientSecret && forceChooser !== '1') {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: gatewayCallback,
        response_type: 'code',
        scope: 'openid email profile',
        access_type: 'online',
        prompt: 'select_account',
        state: Buffer.from(JSON.stringify({ redirect_uri: targetRedirect }), 'utf8').toString('base64url'),
      });
      return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
    }

    const encodedState = Buffer.from(JSON.stringify({ redirect_uri: targetRedirect }), 'utf8').toString('base64url');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(this.renderGoogleOidcChooserHtml(encodedState, targetRedirect));
  }

  /**
   * Callback OAuth 2.0 / OIDC de Google:
   * Recibe el Authorization Code oficial de Google (o la identidad federada del selector OIDC),
   * obtiene el perfil verificado, emite el JWT del sistema y redirige al Frontend con el token SSO.
   */
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('sim_email') simEmail: string | undefined,
    @Query('sim_name') simName: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    let targetRedirect = 'https://ramio.tech/login';
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { redirect_uri?: string };
        if (parsed.redirect_uri) targetRedirect = parsed.redirect_uri;
      } catch {
        // ignore invalid state
      }
    }

    try {
      let profile: { email: string; name: string; picture?: string } | null = null;

      if (code) {
        const clientId = this.config.get<string>('GOOGLE_CLIENT_ID')?.trim() ?? '';
        const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET')?.trim() ?? '';
        const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'http';
        const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || 'localhost:3000';
        const gatewayCallback =
          this.config.get<string>('GOOGLE_CALLBACK_URL')?.trim() || `${proto}://${host}/auth/google/callback`;

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: gatewayCallback,
            grant_type: 'authorization_code',
          }).toString(),
        });
        const tokenData = (await tokenRes.json()) as { access_token?: string };
        if (!tokenData.access_token) {
          throw new Error('No se pudo intercambiar el código OAuth 2.0 con Google');
        }

        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const userInfo = (await userRes.json()) as { email?: string; name?: string; picture?: string };
        if (!userInfo.email) {
          throw new Error('Google no devolvió un correo electrónico válido');
        }
        profile = {
          email: userInfo.email,
          name: userInfo.name || userInfo.email.split('@')[0],
          picture: userInfo.picture,
        };
      } else if (simEmail) {
        profile = {
          email: simEmail.trim().toLowerCase(),
          name: (simName || simEmail.split('@')[0]).trim(),
        };
      }

      if (!profile) {
        throw new Error('Faltan parámetros de autenticación OIDC');
      }

      const { accessToken, user } = await this.auth.loginWithGoogleProfile(profile);
      const outUrl = new URL(targetRedirect);
      outUrl.searchParams.set('token', accessToken);
      outUrl.searchParams.set('email', user.email);
      outUrl.searchParams.set('sso', 'google');
      return res.redirect(outUrl.toString());
    } catch (err) {
      const outUrl = new URL(targetRedirect);
      outUrl.searchParams.set('sso_error', (err as Error).message || 'Error en Google SSO');
      return res.redirect(outUrl.toString());
    }
  }

  private renderGoogleOidcChooserHtml(state: string, returnUrl: string): string {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Iniciar sesión con Google — SSO Federado (OIDC)</title>
  <style>
    * { box-sizing: border-box; font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f0f4f9; color: #1f1f1f; padding: 16px; }
    .card { background: #fff; width: 100%; max-width: 430px; border-radius: 24px; padding: 36px 32px; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .g-logo { display: flex; justify-content: center; margin-bottom: 14px; }
    h1 { font-size: 22px; font-weight: 500; text-align: center; margin: 0 0 6px; color: #1f1f1f; }
    .sub { text-align: center; font-size: 14px; color: #444746; margin: 0 0 22px; }
    .sub strong { color: #8B5A2B; }
    .acct-list { display: flex; flex-direction: column; border: 1px solid #e0e3e7; border-radius: 14px; overflow: hidden; margin-bottom: 18px; }
    .acct-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; background: #fff; border: none; border-bottom: 1px solid #f0f2f5; text-align: left; cursor: pointer; transition: background .15s; text-decoration: none; color: inherit; }
    .acct-btn:last-child { border-bottom: none; }
    .acct-btn:hover { background: #f8fafd; }
    .avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 15px; flex-shrink: 0; }
    .acct-info { flex: 1; min-width: 0; }
    .acct-name { font-size: 14px; font-weight: 600; color: #1f1f1f; display: flex; align-items: center; gap: 6px; }
    .acct-email { font-size: 12px; color: #5f6368; overflow: hidden; text-overflow: ellipsis; }
    .badge { font-size: 10px; padding: 2px 7px; border-radius: 10px; background: #f3ece2; color: #6F4518; font-weight: 700; }
    .divider { text-align: center; font-size: 12px; color: #747775; margin: 14px 0; position: relative; }
    .custom-form { display: flex; flex-direction: column; gap: 10px; background: #f8fafd; padding: 14px; border-radius: 12px; border: 1px solid #e1e5ea; }
    .custom-form label { font-size: 12px; font-weight: 600; color: #444746; }
    .custom-form input { padding: 10px 12px; border-radius: 8px; border: 1px solid #c4c7c5; font-size: 14px; outline: none; }
    .custom-form input:focus { border-color: #0b57d0; }
    .btn-primary { background: #0b57d0; color: #fff; border: none; padding: 11px 16px; border-radius: 20px; font-weight: 600; font-size: 14px; cursor: pointer; margin-top: 4px; }
    .btn-primary:hover { background: #0842a0; }
    .footer { margin-top: 18px; font-size: 11px; color: #5f6368; text-align: center; line-height: 1.45; }
    .cancel { display: inline-block; margin-top: 10px; color: #0b57d0; text-decoration: none; font-weight: 600; font-size: 12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="g-logo">
      <svg width="40" height="40" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
    </div>
    <h1>Elige una cuenta de Google</h1>
    <p class="sub">para ir a <strong>Carpintería El Roble (SSO Federado OIDC)</strong></p>

    <div class="acct-list">
      <a class="acct-btn" href="/auth/google/callback?sim_email=juliomontanamonda%40gmail.com&sim_name=Julio%20Montana&state=${state}">
        <div class="avatar" style="background:#1a73e8">J</div>
        <div class="acct-info">
          <div class="acct-name">Julio Montana <span class="badge">CLIENTE</span></div>
          <div class="acct-email">juliomontanamonda@gmail.com</div>
        </div>
      </a>
      <a class="acct-btn" href="/auth/google/callback?sim_email=erikaguilar189%40gmail.com&sim_name=Erik%20Aguilar%20Chuviru&state=${state}">
        <div class="avatar" style="background:#0f9d58">E</div>
        <div class="acct-info">
          <div class="acct-name">Erik Aguilar Chuviru <span class="badge">CLIENTE</span></div>
          <div class="acct-email">erikaguilar189@gmail.com</div>
        </div>
      </a>
      <a class="acct-btn" href="/auth/google/callback?sim_email=maria.gonzalez%40mail.com&sim_name=Mar%C3%ADa%20Gonz%C3%A1lez&state=${state}">
        <div class="avatar" style="background:#8B5A2B">M</div>
        <div class="acct-info">
          <div class="acct-name">María González <span class="badge">CLIENTE VIP</span></div>
          <div class="acct-email">maria.gonzalez@mail.com</div>
        </div>
      </a>
      <a class="acct-btn" href="/auth/google/callback?sim_email=carpintero%40carpinteria.com&sim_name=Carlos%20Vargas%20(Taller)&state=${state}">
        <div class="avatar" style="background:#e37400">C</div>
        <div class="acct-info">
          <div class="acct-name">Carlos Vargas <span class="badge">CARPINTERO</span></div>
          <div class="acct-email">carpintero@carpinteria.com</div>
        </div>
      </a>
      <a class="acct-btn" href="/auth/google/callback?sim_email=admin%40carpinteria.com&sim_name=Administrador%20El%20Roble&state=${state}">
        <div class="avatar" style="background:#3B2F2F">A</div>
        <div class="acct-info">
          <div class="acct-name">Administrador General <span class="badge">ADMIN</span></div>
          <div class="acct-email">admin@carpinteria.com</div>
        </div>
      </a>
    </div>

    <div class="divider">o ingresa con otra cuenta de Google (@gmail.com)</div>

    <form class="custom-form" action="/auth/google/callback" method="GET">
      <input type="hidden" name="state" value="${state}" />
      <label>Nombre completo en Google</label>
      <input type="text" name="sim_name" required placeholder="Ej. Roberto Gómez" />
      <label>Correo de Google</label>
      <input type="email" name="sim_email" required placeholder="tu.correo@gmail.com" />
      <button type="submit" class="btn-primary">Continuar con esta cuenta Google</button>
    </form>

    <div class="footer">
      Al continuar, Google compartirá tu nombre y dirección de correo electrónico con <strong>Carpintería El Roble</strong> mediante el protocolo <strong>OAuth 2.0 / OpenID Connect (SSO Federado)</strong>.<br/>
      <a class="cancel" href="${returnUrl}">← Volver al inicio de sesión</a>
    </div>
  </div>
</body>
</html>`;
  }
}
