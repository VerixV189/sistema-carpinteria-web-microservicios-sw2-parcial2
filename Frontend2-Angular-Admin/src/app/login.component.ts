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
