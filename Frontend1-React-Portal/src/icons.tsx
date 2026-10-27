/** Iconografía SVG inline (estilo Lucide). Sin emojis ni dependencias. */
import type { CSSProperties } from 'react';

const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const Icons = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  quote: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </>
  ),
  receipt: (
    <>
      <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  workshop: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.1-2.1z" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" />
    </>
  ),
  logout: (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20z" />
      <path d="M12 10v4" />
      <circle cx="12" cy="17" r="0.5" fill="currentColor" />
    </>
  ),
  // Catálogo y landing
  table: (
    <>
      <path d="M3 8h18" /><path d="M5 8v13M19 8v13" /><path d="M3 4h18v4H3z" />
    </>
  ),
  chair: (
    <>
      <path d="M6 19V11" /><path d="M18 19V11" /><path d="M6 11h12" /><path d="M6 3v8" /><path d="M18 3v8" /><path d="M5 11a7 7 0 0 1 14 0" />
    </>
  ),
  wardrobe: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="1" /><path d="M12 2v20" /><path d="M9 8v4M15 8v4" />
    </>
  ),
  bookshelf: (
    <>
      <rect x="3" y="3" width="18" height="18" /><path d="M3 9h18M3 15h18" /><path d="M8 5v4M15 11v4M9 17v4" />
    </>
  ),
  desk: (
    <>
      <path d="M3 7h18" /><path d="M5 7v14M19 7v14" /><rect x="8" y="10" width="8" height="4" /><path d="M3 4h18v3H3z" />
    </>
  ),
  kitchen: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="1" /><path d="M3 10h18M10 10v11" /><path d="M6 6.5h4M13 6.5h5M13 14.5v3" />
    </>
  ),
  door: (
    <>
      <rect x="5" y="2" width="14" height="20" /><rect x="8" y="5" width="8" height="6" /><rect x="8" y="14" width="8" height="5" /><circle cx="16.5" cy="12.5" r="0.5" fill="currentColor" />
    </>
  ),
  bed: (
    <>
      <path d="M2 9v11" /><path d="M2 4v5" /><path d="M2 13h20a2 2 0 0 1 2 2v5" /><path d="M2 17h20" /><path d="M6 9h8a2 2 0 0 1 2 2v2H6z" />
    </>
  ),
  // Comunicación / info
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  mail: (
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    </>
  ),
  chat: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
  arrow: (
    <>
      <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
    </>
  ),
  star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />,
  tree: (
    <>
      <path d="M12 22v-7" /><path d="M12 15 8 11" /><path d="M12 13l4-4" /><path d="M17 3H7l5 5z" /><path d="M19 8H5l7 7z" />
    </>
  ),
  ruler: (
    <>
      <rect x="2" y="9" width="20" height="6" rx="1" /><path d="M6 9v3M10 9v2M14 9v3M18 9v2" />
    </>
  ),
  truck: (
    <>
      <path d="M14 17V5H1v12h13z" /><path d="M14 9h4l4 4v4h-8" /><circle cx="5.5" cy="18.5" r="1.5" /><circle cx="17.5" cy="18.5" r="1.5" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  package: (
    <>
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" /><path d="M12 16v-5" /><circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </>
  ),
  send: <path d="m22 2-7 20-4-9-9-4Z" />,
};

export function Icon({ name, size = 18, style }: { name: keyof typeof Icons; size?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} {...base}>
      {Icons[name]}
    </svg>
  );
}
