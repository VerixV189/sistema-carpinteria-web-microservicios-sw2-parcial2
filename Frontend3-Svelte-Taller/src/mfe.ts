/**
 * Punto de entrada microfrontend (single-spa).
 * Se construye con `vite build --config vite.mfe.config.ts` → dist-mfe/mfe.js
 * El portal lo carga con import() nativo y llama a los lifecycles.
 */
import Workshop from './lib/Workshop.svelte';

let app: Workshop | null = null;
let linkEl: HTMLLinkElement | null = null;

export async function bootstrap(): Promise<void> {
  // CSS del bundle lib: vite lo emite como mfe.css junto a mfe.js
  if (!linkEl) {
    linkEl = document.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = 'http://localhost:4204/mfe-assets/style.css';
    document.head.appendChild(linkEl);
  }
}

export async function mount(props: { domElement?: HTMLElement }): Promise<void> {
  const target = props?.domElement ?? document.getElementById('workshop-slot');
  if (!target) throw new Error('workshop-slot no encontrado');
  app = new Workshop({ target });
}

export async function unmount(): Promise<void> {
  app?.$destroy();
  app = null;
}
