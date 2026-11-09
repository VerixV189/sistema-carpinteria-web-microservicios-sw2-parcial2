import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page">
      <form class="card" (ngSubmit)="submit()">
        <div class="head">
          <img src="/logo_el_roble.png" onerror="this.onerror=null;this.src='assets/logo_el_roble.png'" class="logo-img" alt="Carpintería El Roble" />
          <h2>Panel de Administración</h2>
          <p>Carpintería El Roble — acceso restringido</p>
        </div>
        <label>Correo electrónico
          <input type="email" [(ngModel)]="email" name="email" required placeholder="admin@carpinteria.com" />
        </label>
        <label>Contraseña
          <input type="password" [(ngModel)]="password" name="password" required placeholder="••••••••" />
        </label>
        @if (error) { <p class="error">{{ error }}</p> }
        <button type="submit" [disabled]="loading">{{ loading ? 'Verificando…' : 'Ingresar' }}</button>
        <div class="divider"><span>o SSO Federado</span></div>
        <button type="button" class="google-btn" (click)="loginWithGoogle()">
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Continuar con Google
        </button>
      </form>
    </div>
  `,
  styles: [`
    .page { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #F5F1EC; }
    .card { background: #fff; padding: 36px 32px; border-radius: 12px; box-shadow: 0 8px 24px rgba(59,47,47,.12); display: flex; flex-direction: column; gap: 14px; width: 360px; }
    .head { text-align: center; margin-bottom: 8px; }
    .logo-img { width: 64px; height: 64px; border-radius: 14px; object-fit: cover; margin-bottom: 10px; box-shadow: 0 4px 12px rgba(59,47,47,.16); }
    .head h2 { margin: 0; color: #3B2F2F; font-size: 19px; }
    .head p { margin: 4px 0 0; color: #8a7f75; font-size: 13px; }
    label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: #5c534a; font-weight: 600; }
    input { padding: 10px 12px; border-radius: 8px; border: 1px solid #ddd4c8; font-size: 14px; }
    .error { margin: 0; color: #a33; font-size: 13px; background: #fdf1f1; padding: 8px 12px; border-radius: 6px; }
    button { background: #8B5A2B; color: #fff; border: none; padding: 11px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; margin-top: 4px; }
    button:disabled { opacity: .6; }
    .divider { display: flex; align-items: center; justify-content: center; font-size: 11px; color: #8a7f75; font-weight: 600; text-transform: uppercase; }
    .google-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; background: #fff; color: #3c4043; border: 1px solid #dadce0; padding: 10px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; margin-top: 0; }
  `],
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {
    this.auth.acceptHandoff();
    if (this.auth.session()?.role === 'ADMIN') {
      this.router.navigate(['/clientes']);
    }
  }

  loginWithGoogle() {
    const host = window.location.hostname;
    const isHttps = window.location.protocol === 'https:';
    const rootDomain = host.replace(/^(www|admin|taller|api)\./, '');
    const gateway = isHttps ? `https://api.${rootDomain}` : `http://${host}:3000`;
    window.location.href = `${gateway}/auth/google?redirect_uri=${encodeURIComponent(window.location.href.split('?')[0])}`;
  }

  async submit() {
    this.error = '';
    this.loading = true;
    try {
      const s = await this.auth.login(this.email.trim(), this.password);
      if (s.role !== 'ADMIN') {
        this.error = 'Esta consola es solo para administradores';
        this.auth.logout();
        return;
      }
      this.router.navigate(['/clientes']);
    } catch {
      this.error = 'Credenciales inválidas o servicio no disponible';
    } finally {
      this.loading = false;
    }
  }
}
