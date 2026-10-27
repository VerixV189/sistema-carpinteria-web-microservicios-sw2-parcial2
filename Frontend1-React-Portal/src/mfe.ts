/**
 * Cargadores de microfrontends (single-spa / mountRootParcel).
 * Los remotes son ES modules servidos desde su propio origen (CORS *).
 * La sesión se comparte vía localStorage al ejecutarse en el mismo origen.
 */

import { start } from 'single-spa';

// Angular se sirve bajo /admin/ (base-href): el manifest y chunks viven ahí.
const ADMIN_BASE = 'http://localhost:4202';
const WORKSHOP_URL = 'http://localhost:4204';

start();

/** Angular (native federation): resolve el chunk expuesto vía remoteEntry.json. */
export async function loadAdminApp() {
  let base = `${ADMIN_BASE}/admin`;
  let res = await fetch(`${base}/remoteEntry.json`).catch(() => null);
  if (!res || !res.ok) {
    base = ADMIN_BASE;
    res = await fetch(`${base}/remoteEntry.json`);
  }
  const manifest = await res.json();
  const expose = manifest.exposes.find((e: { key: string }) => e.key === './lifecycles');
  return import(/* @vite-ignore */ `${base}/${expose.outFileName}`);
}

/** Svelte: bundle lib-mode (vite) con lifecycles exportados. */
export function loadWorkshopApp() {
  return import(/* @vite-ignore */ `${WORKSHOP_URL}/mfe-assets/mfe.js`);
}
