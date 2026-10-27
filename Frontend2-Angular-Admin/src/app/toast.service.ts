import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  type: 'ok' | 'err' | 'info';
  text: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly list = signal<Toast[]>([]);
  private seq = 0;

  private push(type: Toast['type'], text: string): void {
    const id = ++this.seq;
    this.list.update((t) => [...t, { id, type, text }]);
    setTimeout(() => this.list.update((t) => t.filter((x) => x.id !== id)), 4500);
  }

  ok(text: string): void { this.push('ok', text); }
  err(text: string): void { this.push('err', text); }
  info(text: string): void { this.push('info', text); }

  /** Extrae un mensaje legible de errores Apollo/HTTP. */
  fromError(e: unknown, fallback = 'Operación fallida'): void {
    const anyErr = e as { message?: string; graphQLErrors?: { message: string }[] };
    const gqlMsg = anyErr?.graphQLErrors?.[0]?.message;
    this.err(gqlMsg ?? anyErr?.message ?? fallback);
  }
}
