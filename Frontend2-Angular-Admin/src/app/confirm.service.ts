import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

/** Modal de confirmación global — `await confirm.ask({...})` → boolean. */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly current = signal<(ConfirmRequest & { resolve: (v: boolean) => void }) | null>(null);

  ask(req: ConfirmRequest): Promise<boolean> {
    return new Promise((resolve) => this.current.set({ ...req, resolve }));
  }

  answer(value: boolean): void {
    this.current()?.resolve(value);
    this.current.set(null);
  }
}
