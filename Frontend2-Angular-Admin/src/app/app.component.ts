import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';
import { AgentChatComponent } from './agent-chat.component';
import { ToastService } from './toast.service';
import { ConfirmService } from './confirm.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AgentChatComponent],
  template: `
    @if (isLogin()) {
      <router-outlet />
    } @else {
      <div class="layout" [class.con-chat]="chatOpen()">
        <aside class="side">
          <div class="brand"><span class="logo">ER</span><h3>Panel Admin</h3></div>
          <a routerLink="/dashboard" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>
            Dashboard
          </a>
          <div class="sec">Gestión</div>
          <a routerLink="/clientes" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Clientes
          </a>
          <a routerLink="/carpinteros" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.1-2.1z"/></svg>
            Carpinteros
          </a>
          <a routerLink="/pedidos" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            Pedidos
          </a>
          <a routerLink="/entregas" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M5 17h-2v-11a1 1 0 0 1 1-1h9v12"/><path d="M14 8h4l4 4v5h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
            Entregas
          </a>
          <div class="sec">Comercial</div>
          <a routerLink="/marketplace" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Marketplace
          </a>
          <a routerLink="/cotizaciones" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
            Cotizaciones
          </a>
          <div class="sec">Inteligencia</div>
          <a routerLink="/reportes" routerLinkActive="active">
            <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Reportes IA
          </a>
          <div class="foot">
            <span class="who">{{ email() }}</span>
            <button class="out" (click)="logout()">
              <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
              Salir
            </button>
          </div>
        </aside>
        <main class="content">
          <router-outlet />
        </main>
        <app-agent-chat [(open)]="chatOpen" />
        <div class="toast-wrap">
          @for (t of toast.list(); track t.id) {
            <div class="toast" [class]="'toast ' + t.type">{{ t.text }}</div>
          }
        </div>
        @if (confirm.current(); as c) {
          <div class="modal-backdrop" style="z-index:1100" (click)="confirm.answer(false)">
            <div class="modal" style="width:min(400px,94vw)" (click)="$event.stopPropagation()">
              <div class="modal-head"><h3>{{ c.title }}</h3></div>
              @if (c.message) { <div class="modal-body" style="font-size:13px">{{ c.message }}</div> }
              <div class="modal-foot">
                <button class="btn btn-ghost" (click)="confirm.answer(false)">Cancelar</button>
                <button class="btn" [class.btn-danger]="c.danger" (click)="confirm.answer(true)">{{ c.confirmLabel ?? 'Confirmar' }}</button>
              </div>
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .side { width: 230px; background: #fff; border-right: 1px solid #eee; padding: 20px; display: flex; flex-direction: column; gap: 4px; position: sticky; top: 0; height: 100vh; overflow-y: auto; }
    .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
    .logo { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 8px; background: #8B5A2B; color: #FAF7F2; font-size: 13px; font-weight: 800; }
    .side h3 { margin: 0; color: #8B5A2B; font-size: 17px; }
    .sec { font-size: 10px; text-transform: uppercase; letter-spacing: .09em; color: #a89a8c; margin: 14px 0 2px; padding: 0 12px; }
    .side a { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; text-decoration: none; color: #555; font-size: 14px; }
    .side a svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .side a.active { background: rgba(139,90,43,.1); color: #8B5A2B; font-weight: 600; }
    .foot { margin-top: auto; border-top: 1px solid #eee; padding-top: 14px; display: flex; flex-direction: column; gap: 8px; }
    .who { font-size: 12px; color: #8a7f75; overflow: hidden; text-overflow: ellipsis; }
    .out { display: flex; align-items: center; gap: 8px; background: none; border: 1px solid #ddd4c8; padding: 8px 12px; border-radius: 8px; cursor: pointer; color: #5c534a; font-size: 13px; }
    .out svg { width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    .content { flex: 1; padding: 24px; min-width: 0; transition: margin-right .25s ease-out; }
    .layout.con-chat .content { margin-right: 400px; }
    @media (max-width: 940px) {
      .layout.con-chat .content { margin-right: 0; }
    }
  `],
})
export class AppComponent {
  chatOpen = signal(false);

  constructor(private auth: AuthService, private router: Router, public toast: ToastService, public confirm: ConfirmService) {}

  isLogin() { return this.router.url === '/login'; }
  email() { return this.auth.session()?.email ?? ''; }
  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
