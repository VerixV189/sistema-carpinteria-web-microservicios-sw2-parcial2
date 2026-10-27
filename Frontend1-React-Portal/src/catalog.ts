/** Catálogo público — mismos tipos y precios base que el estimador IA (Backend3).
 *  Imágenes servidas desde Cloudinary (carpinteria/catalog/) con transformación
 *  responsive: c_fill 800x500, q_auto, f_auto.
 */
import type { Icons } from './icons';

export interface Product {
  key: string;
  name: string;
  description: string;
  basePrice: number; // Bs — coincide con BASE_PRICE_BY_TYPE del estimador
  icon: keyof typeof Icons;
  image: string; // Cloudinary
}

const IMG = (name: string) =>
  `https://res.cloudinary.com/dwerzrgya/image/upload/c_fill,w_800,h_500,q_auto,f_auto/carpinteria/catalog/catalog-${name}.jpg`;

export const PRODUCTS: Product[] = [
  { key: 'TABLE', name: 'Mesas a medida', description: 'Comedores, mesas de centro y auxiliares en madera maciza o melamina, del tamaño exacto de tu espacio.', basePrice: 1800, icon: 'table', image: IMG('table') },
  { key: 'CHAIR', name: 'Sillas y bancas', description: 'Sillas, taburetes y bancas ergonómicas con acabado sellado, para comedor, oficina o barra.', basePrice: 450, icon: 'chair', image: IMG('chair') },
  { key: 'WARDROBE', name: 'Roperos y clósets', description: 'Roperos empotrados o independientes con distribución interior a medida: cajones, colgadores y zapateras.', basePrice: 3200, icon: 'wardrobe', image: IMG('wardrobe') },
  { key: 'BOOKSHELF', name: 'Bibliotecas y estanterías', description: 'Estanterías de piso a techo, bibliotecas modulares y repisas flotantes para sala u oficina.', basePrice: 1500, icon: 'bookshelf', image: IMG('bookshelf') },
  { key: 'DESK', name: 'Escritorios', description: 'Escritorios de oficina y home-office con canal de cables, gavetas y superficie resistente.', basePrice: 1600, icon: 'desk', image: IMG('desk') },
  { key: 'KITCHEN_CABINET', name: 'Muebles de cocina', description: 'Gabinetes bajo y sobre mesada, despenseros y barras de desayuno, con herrajes de cierre suave.', basePrice: 5500, icon: 'kitchen', image: IMG('kitchen') },
  { key: 'DOOR', name: 'Puertas', description: 'Puertas de interior y principal en madera noble, con diseños tallados y herrajes incluidos.', basePrice: 900, icon: 'door', image: IMG('door') },
  { key: 'BED', name: 'Camas y cabeceras', description: 'Camas, cabeceras tapizadas o en madera y burós, en todas las medidas estándar o a pedido.', basePrice: 2800, icon: 'bed', image: IMG('bed') },
];

export const WOODS = [
  { name: 'Mara', note: 'Madera fina nacional, veta elegante', factor: 'premium' },
  { name: 'Roble', note: 'Dureza y presencia clásica', factor: 'premium' },
  { name: 'Cedro', note: 'Aroma natural, repele polilla', factor: 'media' },
  { name: 'Pino', note: 'Ligero y versátil', factor: 'económico' },
  { name: 'Melamina', note: 'Resistente, fácil limpieza', factor: 'económico' },
];

export function formatBs(n: number): string {
  return `Bs ${n.toLocaleString('es-BO', { minimumFractionDigits: 0 })}`;
}
