import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActionItem {
  label: string;
  danger?: boolean;
  disabled?: boolean;
  run: () => void;
}

/** Menú de acciones por fila (⋮). */
@Component({
  selector: 'app-actions-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="am-wrap" (click)="$event.stopPropagation()">
      <button class="am-btn" type="button" (click)="open = !open" aria-label="Acciones">⋮</button>
      @if (open) {
        <div class="am-menu">
          @for (it of items; track it.label) {
            <button type="button" class="am-item" [class.danger]="it.danger" [disabled]="it.disabled" (click)="pick(it)">
              {{ it.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .am-wrap { position: relative; display: inline-block; }
    .am-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid #ddd4c8; background: #fff; cursor: pointer; font-size: 16px; line-height: 1; color: #5c534a; }
    .am-btn:hover { background: #F5F1EC; }
    .am-menu { position: absolute; right: 0; top: calc(100% + 4px); min-width: 170px; background: #fff; border: 1px solid #EDE4D8; border-radius: 10px; box-shadow: 0 8px 26px rgba(0,0,0,.18); padding: 5px; z-index: 950; display: flex; flex-direction: column; }
    .am-item { text-align: left; background: none; border: none; padding: 8px 11px; border-radius: 7px; font-size: 13px; color: #3B2F2F; cursor: pointer; white-space: nowrap; }
    .am-item:hover:not(:disabled) { background: #F5F1EC; }
    .am-item.danger { color: #b03434; }
    .am-item.danger:hover:not(:disabled) { background: #fdf1f1; }
    .am-item:disabled { opacity: .45; cursor: default; }
  `],
})
export class ActionsMenuComponent {
  @Input() items: ActionItem[] = [];
  @Output() closed = new EventEmitter<void>();
  open = false;

  pick(it: ActionItem): void {
    this.open = false;
    if (!it.disabled) it.run();
  }

  @HostListener('document:click')
  close(): void {
    if (this.open) { this.open = false; this.closed.emit(); }
  }
}
