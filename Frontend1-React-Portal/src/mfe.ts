/**
 * Cargadores de microfrontends (single-spa / mountRootParcel).
 * Los remotes son ES modules servidos desde su propio origen (CORS *).
 * La sesión se comparte vía localStorage al ejecutarse en el mismo origen.
 */

import { start } from 'single-spa';

// Angular se sirve bajo /admin/ (base-href): el manifest y chunks viven ahí.
const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const IS_HTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:';
const ROOT_DOMAIN = HOST.replace(/^(www|admin|taller|api)\./, '');
const ADMIN_BASE = IS_HTTPS ? `https://admin.${ROOT_DOMAIN}` : `http://${HOST}:4202`;
const WORKSHOP_URL = IS_HTTPS ? `https://taller.${ROOT_DOMAIN}` : `http://${HOST}:4204`;

start();

/** Angular (native federation): resolve el chunk expuesto vía remoteEntry.json. */
export async function loadAdminApp() {
  let base = `${ADMIN_BASE}/admin`;
  let res = await fetch(`${base}/remoteEntry.json`).catch(() => null);
  const isJson = res && res.ok && (res.headers.get('content-type') ?? '').includes('json');
  if (!isJson) {
    base = ADMIN_BASE;
    res = await fetch(`${base}/remoteEntry.json`);
  }
  const manifest = await res!.json();
  const expose = manifest.exposes.find((e: { key: string }) => e.key === './lifecycles');
  return import(/* @vite-ignore */ `${base}/${expose.outFileName}`);
}

/** Svelte: bundle lib-mode (vite) con lifecycles exportados. */
export function loadWorkshopApp() {
  return import(/* @vite-ignore */ `${WORKSHOP_URL}/mfe-assets/mfe.js`);
}
