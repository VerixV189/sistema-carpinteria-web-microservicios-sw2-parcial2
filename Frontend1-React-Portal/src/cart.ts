import type { MarketplaceProduct } from './api';

export interface CartItem {
  product: MarketplaceProduct;
  quantity: number;
}

const CART_KEY = 'carpinteria_cart';
const CART_EVENT = 'carpinteria_cart_change';

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addToCart(product: MarketplaceProduct, qty = 1) {
  const items = getCart();
  const idx = items.findIndex((i) => i.product.id === product.id);
  if (idx !== -1) {
    items[idx].quantity = Math.min(product.stock, items[idx].quantity + qty);
  } else {
    items.push({ product, quantity: Math.min(product.stock, qty) });
  }
  saveCart(items);
}

export function updateCartQty(productId: string, qty: number) {
  const items = getCart();
  const idx = items.findIndex((i) => i.product.id === productId);
  if (idx === -1) return;
  if (qty <= 0) {
    items.splice(idx, 1);
  } else {
    items[idx].quantity = Math.min(items[idx].product.stock, qty);
  }
  saveCart(items);
}

export function clearCart() {
  saveCart([]);
}

export function cartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}

export function cartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}

export function subscribeCart(cb: () => void): () => void {
  window.addEventListener(CART_EVENT, cb);
  return () => window.removeEventListener(CART_EVENT, cb);
}
