import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api, type MarketplaceProduct, type UpsertProductInput } from '../api';
import { getSession } from '../auth';
import {
  addToCart,
  cartTotal,
  clearCart,
  getCart,
  subscribeCart,
  updateCartQty,
  type CartItem,
} from '../cart';
import { WOODS, formatBs } from '../catalog';
import { Icon } from '../icons';

const CATEGORIES = ['Todos', 'Mesas', 'Sillas', 'Roperos', 'Puertas', 'Cocina'];
const WOOD_OPTIONS = ['Roble', 'Mara', 'Cedro', 'Pino', 'Melamina'];

const DEFAULT_IMG =
  'https://res.cloudinary.com/dwerzrgya/image/upload/c_fill,w_800,h_500,q_auto,f_auto/carpinteria/catalog/catalog-table.jpg';

export default function CatalogPage() {
  const session = getSession();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');

  // Carrito y Checkout
  const [cart, setCart] = useState<CartItem[]>(getCart());
  const [cartOpen, setCartOpen] = useState(searchParams.get('cart') === '1');
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [address, setAddress] = useState('Av. Cristo Redentor 4to Anillo, Santa Cruz');
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [cardHolder, setCardHolder] = useState(session?.email?.split('@')[0]?.toUpperCase() || 'CLIENTE EL ROBLE');
  const [expiryMonth, setExpiryMonth] = useState(12);
  const [expiryYear, setExpiryYear] = useState(2028);
  const [cvv, setCvv] = useState('123');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState<string | null>(null);

  // Modal CRUD para Admin / Carpintero
  const canManage = session?.role === 'ADMIN' || session?.role === 'CARPENTER';
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [crudOpen, setCrudOpen] = useState(false);
  const [form, setForm] = useState<UpsertProductInput>({
    name: '',
    category: 'Mesas',
    woodType: 'Roble',
    dimensions: '180 x 90 x 76 cm',
    price: 1800,
    estimatedDays: 10,
    stock: 3,
    description: '',
    imageUrl: '',
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [savingCrud, setSavingCrud] = useState(false);
  const [crudError, setCrudError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await api.products();
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    return subscribeCart(() => setCart(getCart()));
  }, []);

  useEffect(() => {
    if (searchParams.get('cart') === '1') {
      setCartOpen(true);
    }
  }, [searchParams]);

  const filtered = products.filter((p) => {
    const matchCat = category === 'Todos' || p.category.toLowerCase() === category.toLowerCase();
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.woodType.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleBuy = (p: MarketplaceProduct) => {
    if (p.stock <= 0) return;
    addToCart(p, 1);
    setPaySuccess(null);
    setCartOpen(true);
  };

  const handleQuoteCustom = (p: MarketplaceProduct) => {
    const target = `/cotizar?desc=${encodeURIComponent(`${p.name} (${p.dimensions})`)}&wood=${encodeURIComponent(p.woodType)}`;
    if (!session) {
      navigate(`/login?next=${encodeURIComponent(target)}`);
      return;
    }
    navigate(target);
  };

  const pedirGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => undefined,
      { timeout: 8000 },
    );
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      navigate('/login?next=/productos?cart=1');
      return;
    }
    if (cart.length === 0) return;
    setPayError('');
    setPaying(true);
    try {
      const res = await api.checkoutMarketplace({
        items: cart.map((c) => ({ productId: c.product.id, quantity: c.quantity })),
        deliveryType,
        deliveryAddress: deliveryType === 'DELIVERY' ? address : 'Recojo en taller',
        deliveryLat: deliveryType === 'DELIVERY' ? gps?.lat : undefined,
        deliveryLng: deliveryType === 'DELIVERY' ? gps?.lng : undefined,
        notes: notes.trim() || undefined,
        cardNumber: cardNumber.replace(/\s+/g, ''),
        cardHolder,
        expiryMonth: Number(expiryMonth),
        expiryYear: Number(expiryYear),
        cvv,
      });
      clearCart();
      setPaySuccess(
        `¡Compra confirmada (#${res.marketplaceRef})! El pedido entró a producción y tu recibo PDF ya se está generando en "Mis Recibos".`,
      );
      await loadProducts();
    } catch (err) {
      setPayError((err as Error).message || 'No se pudo procesar la compra');
    } finally {
      setPaying(false);
    }
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      name: '',
      category: 'Mesas',
      woodType: 'Roble',
      dimensions: '180 x 90 x 76 cm',
      price: 1800,
      estimatedDays: 10,
      stock: 3,
      description: '',
      imageUrl: '',
    });
    setPhotoFile(null);
    setCrudError('');
    setCrudOpen(true);
  };

  const openEditModal = (p: MarketplaceProduct) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      category: p.category,
      woodType: p.woodType,
      dimensions: p.dimensions,
      price: p.price,
      estimatedDays: p.estimatedDays,
      stock: p.stock,
      description: p.description,
      imageUrl: p.imageUrl ?? '',
    });
    setPhotoFile(null);
    setCrudError('');
    setCrudOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setCrudError('');
    setSavingCrud(true);
    try {
      let uploadedUrl = form.imageUrl?.trim() || undefined;
      if (photoFile) {
        const s3Url = await api.uploadPhoto(photoFile, 'marketplace');
        if (s3Url) uploadedUrl = s3Url;
      }
      const payload: UpsertProductInput = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        estimatedDays: Number(form.estimatedDays ?? 10),
        imageUrl: uploadedUrl,
      };
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setCrudOpen(false);
      await loadProducts();
    } catch (err) {
      setCrudError((err as Error).message || 'No se pudo guardar el mueble');
    } finally {
      setSavingCrud(false);
    }
  };

  const handleDeleteProduct = async (p: MarketplaceProduct) => {
    if (!window.confirm(`¿Eliminar "${p.name}" del Marketplace?`)) return;
    try {
      await api.deleteProduct(p.id);
      await loadProducts();
    } catch (err) {
      alert((err as Error).message || 'No se pudo eliminar');
    }
  };

  const totalItems = cart.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div style={s.page}>
      <div style={s.container}>
        <div style={s.headerRow}>
          <div>
            <h1 style={s.h1}>Marketplace de Muebles y Catálogo</h1>
            <p style={s.sub}>
              Compra muebles listos con stock inmediato (Flujo Marketplace) o solicita una versión
              personalizada a tu medida con IA (Flujo Cotización).
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {canManage && (
              <button onClick={openCreateModal} style={s.publishBtn}>
                + Publicar Mueble (S3)
              </button>
            )}
            <button
              onClick={() => {
                setCartOpen(true);
                setSearchParams({ cart: '1' });
              }}
              style={s.cartTriggerBtn}
            >
              <Icon name="package" size={16} />
              Carrito ({totalItems}) • {formatBs(cartTotal())}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda y filtro por categoría */}
        <div style={s.filterBar}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comedores, sillas, roperos, puertas, madera..."
            style={s.searchInput}
          />
          <div style={s.chips}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  ...s.chip,
                  ...(category === cat ? s.chipActive : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#8a7f75', textAlign: 'center', padding: 40 }}>
            Cargando muebles del Marketplace…
          </p>
        ) : filtered.length === 0 ? (
          <div style={s.emptyBox}>
            <p style={{ margin: 0, color: '#6d6157' }}>
              No se encontraron muebles con ese filtro.
            </p>
          </div>
        ) : (
          <div style={s.grid}>
            {filtered.map((p) => {
              const outOfStock = p.stock <= 0;
              return (
                <div key={p.id} style={s.card}>
                  <div style={s.imgWrap}>
                    <img
                      src={p.imageUrl || DEFAULT_IMG}
                      alt={p.name}
                      loading="lazy"
                      style={s.img}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = DEFAULT_IMG;
                      }}
                    />
                    <span style={s.catBadge}>{p.category}</span>
                    <span
                      style={{
                        ...s.stockBadge,
                        background: outOfStock ? '#FEE2E2' : '#DCFCE7',
                        color: outOfStock ? '#991B1B' : '#166534',
                      }}
                    >
                      {outOfStock ? 'Agotado' : `${p.stock} disp.`}
                    </span>
                  </div>
                  <div style={s.cardBody}>
                    <h3 style={s.name}>{p.name}</h3>
                    <div style={s.metaLine}>
                      <span>Madera: <b>{p.woodType}</b></span>
                      <span>•</span>
                      <span>{p.dimensions}</span>
                    </div>
                    <div style={s.metaLine}>
                      <span>Entrega est.: ~{p.estimatedDays} días</span>
                      {p.carpenterName && (
                        <>
                          <span>•</span>
                          <span>Taller: {p.carpenterName}</span>
                        </>
                      )}
                    </div>
                    <p style={s.desc}>{p.description}</p>
                    <div style={s.foot}>
                      <div>
                        <span style={{ fontSize: 11, color: '#8a7f75', display: 'block' }}>
                          Precio venta directa
                        </span>
                        <span style={s.price}>{formatBs(p.price)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleQuoteCustom(p)}
                          style={s.quoteBtn}
                          title="Solicitar con otras medidas o madera"
                        >
                          Cotizar IA
                        </button>
                        <button
                          onClick={() => handleBuy(p)}
                          disabled={outOfStock}
                          style={{
                            ...s.buyBtn,
                            opacity: outOfStock ? 0.5 : 1,
                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {outOfStock ? 'Sin stock' : 'Comprar'}
                        </button>
                      </div>
                    </div>

                    {canManage && (
                      <div style={s.adminBar}>
                        <button onClick={() => openEditModal(p)} style={s.editSmallBtn}>
                          Editar / Stock
                        </button>
                        <button onClick={() => handleDeleteProduct(p)} style={s.delSmallBtn}>
                          Eliminar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <section style={s.woods}>
          <h2 style={s.h2}>
            <Icon name="tree" size={20} style={{ verticalAlign: -3, marginRight: 8 }} />
            Maderas certificadas que trabajamos
          </h2>
          <div style={s.woodGrid}>
            {WOODS.map((w) => (
              <div key={w.name} style={s.woodCard}>
                <strong style={{ color: '#3B2F2F' }}>{w.name}</strong>
                <span style={{ color: '#8a7f75', fontSize: 13 }}>{w.note}</span>
                <span style={s.tag}>{w.factor}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Drawer / Modal de Carrito y Checkout del Marketplace */}
      {cartOpen && (
        <div
          style={s.backdrop}
          onClick={() => {
            setCartOpen(false);
            setSearchParams({});
          }}
        >
          <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={s.drawerHead}>
              <h2 style={{ margin: 0, fontSize: 20, color: '#3B2F2F' }}>
                Carrito del Marketplace
              </h2>
              <button
                onClick={() => {
                  setCartOpen(false);
                  setSearchParams({});
                }}
                style={s.closeBtn}
              >
                ✕
              </button>
            </div>

            {paySuccess && (
              <div style={s.successBox}>
                <p style={{ margin: '0 0 10px', fontWeight: 600 }}>{paySuccess}</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to="/recibos" style={s.buyBtn}>
                    Ver Mis Recibos PDF
                  </Link>
                </div>
              </div>
            )}

            {cart.length === 0 ? (
              <p style={{ color: '#8a7f75', textAlign: 'center', padding: '32px 0' }}>
                Tu carrito está vacío. Elige un mueble disponible en el Marketplace.
              </p>
            ) : (
              <form onSubmit={handleCheckout} style={s.checkoutForm}>
                <div style={s.cartList}>
                  {cart.map((item) => (
                    <div key={item.product.id} style={s.cartRow}>
                      <div style={{ flex: 1 }}>
                        <strong style={{ color: '#3B2F2F', fontSize: 14 }}>
                          {item.product.name}
                        </strong>
                        <div style={{ fontSize: 12, color: '#8a7f75' }}>
                          {item.product.woodType} • {formatBs(item.product.price)} c/u
                        </div>
                      </div>
                      <div style={s.qtyControls}>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          style={s.qtyBtn}
                        >
                          -
                        </button>
                        <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          style={s.qtyBtn}
                        >
                          +
                        </button>
                      </div>
                      <strong style={{ color: '#8B5A2B', minWidth: 80, textAlign: 'right' }}>
                        {formatBs(item.product.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>

                <div style={s.totalBar}>
                  <span>Total a pagar:</span>
                  <strong style={{ fontSize: 20, color: '#8B5A2B' }}>
                    {formatBs(cartTotal())}
                  </strong>
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>Modalidad de entrega</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY')}
                      style={{
                        ...s.chip,
                        flex: 1,
                        ...(deliveryType === 'DELIVERY' ? s.chipActive : {}),
                      }}
                    >
                      Envío a domicilio
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('PICKUP')}
                      style={{
                        ...s.chip,
                        flex: 1,
                        ...(deliveryType === 'PICKUP' ? s.chipActive : {}),
                      }}
                    >
                      Recojo en taller
                    </button>
                  </div>
                </div>

                {deliveryType === 'DELIVERY' && (
                  <div style={s.fieldGroup}>
                    <label style={s.label}>Dirección de entrega</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Av. / Calle / Número / Referencia"
                        style={{ ...s.input, flex: 1 }}
                      />
                      <button type="button" onClick={pedirGps} style={s.quoteBtn}>
                        {gps ? 'GPS OK' : 'Usar GPS'}
                      </button>
                    </div>
                  </div>
                )}

                <div style={s.fieldGroup}>
                  <label style={s.label}>Notas para el carpintero (opcional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ej. Piso 2, timbre B, tono de barniz mate..."
                    style={s.input}
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #EDE4D8', margin: '10px 0' }} />

                <div style={s.fieldGroup}>
                  <label style={s.label}>Tarjeta de pago (Pasarela CU6)</label>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    style={s.input}
                  />
                </div>

                <div style={s.fieldGroup}>
                  <label style={s.label}>Titular de la tarjeta</label>
                  <input
                    type="text"
                    required
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    style={s.input}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Mes</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      required
                      value={expiryMonth}
                      onChange={(e) => setExpiryMonth(Number(e.target.value))}
                      style={s.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>Año</label>
                    <input
                      type="number"
                      min={2025}
                      max={2035}
                      required
                      value={expiryYear}
                      onChange={(e) => setExpiryYear(Number(e.target.value))}
                      style={s.input}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.label}>CVV</label>
                    <input
                      type="text"
                      required
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      style={s.input}
                    />
                  </div>
                </div>

                {payError && <p style={{ color: '#B91C1C', fontSize: 13, margin: 0 }}>{payError}</p>}

                <button type="submit" disabled={paying} style={s.paySubmitBtn}>
                  {paying
                    ? 'Procesando compra y generando recibo…'
                    : `Pagar y Comprar (${formatBs(cartTotal())})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal CRUD de Mueble (Admin / Carpintero) con subida a AWS S3 */}
      {crudOpen && (
        <div style={s.backdrop} onClick={() => setCrudOpen(false)}>
          <div style={s.drawer} onClick={(e) => e.stopPropagation()}>
            <div style={s.drawerHead}>
              <h2 style={{ margin: 0, fontSize: 20, color: '#3B2F2F' }}>
                {editingProduct ? 'Editar Mueble del Marketplace' : 'Publicar Mueble en Marketplace'}
              </h2>
              <button onClick={() => setCrudOpen(false)} style={s.closeBtn}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProduct} style={s.checkoutForm}>
              <div style={s.fieldGroup}>
                <label style={s.label}>Nombre del mueble</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ej. Mesa de Comedor Imperial 8 Personas"
                  style={s.input}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={s.input}
                  >
                    {CATEGORIES.filter((c) => c !== 'Todos').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Madera</label>
                  <select
                    value={form.woodType}
                    onChange={(e) => setForm({ ...form, woodType: e.target.value })}
                    style={s.input}
                  >
                    {WOOD_OPTIONS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Dimensiones</label>
                <input
                  type="text"
                  required
                  value={form.dimensions}
                  onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  placeholder="Ej. 200 x 100 x 76 cm"
                  style={s.input}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Precio (Bs)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    style={s.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Stock disponible</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    style={s.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={s.label}>Días entrega</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.estimatedDays ?? 10}
                    onChange={(e) => setForm({ ...form, estimatedDays: Number(e.target.value) })}
                    style={s.input}
                  />
                </div>
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Descripción y acabado</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe el acabado, herrajes y detalles del mueble..."
                  style={{ ...s.input, resize: 'vertical' }}
                />
              </div>

              <div style={s.fieldGroup}>
                <label style={s.label}>Foto del mueble (Subida a Bucket AWS S3)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                  style={s.input}
                />
              </div>

              {crudError && (
                <p style={{ color: '#B91C1C', fontSize: 13, margin: 0 }}>{crudError}</p>
              )}

              <button type="submit" disabled={savingCrud} style={s.paySubmitBtn}>
                {savingCrud
                  ? 'Subiendo a S3 y guardando…'
                  : editingProduct
                    ? 'Guardar Cambios'
                    : 'Publicar en Marketplace'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    background: '#F5F1EC',
    minHeight: 'calc(100vh - 64px)',
    fontFamily: 'Inter, system-ui, sans-serif',
    padding: '32px 0 64px',
  },
  container: { maxWidth: 1400, margin: '0 auto', padding: '0 24px' },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  h1: { margin: '0 0 8px', color: '#3B2F2F', fontSize: 30 },
  sub: { margin: 0, color: '#8a7f75', fontSize: 15, maxWidth: 680, lineHeight: 1.55 },
  publishBtn: {
    background: '#1E7B45',
    color: '#fff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  cartTriggerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    background: '#8B5A2B',
    color: '#fff',
    border: 'none',
    padding: '11px 18px',
    borderRadius: 9,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    background: '#fff',
    padding: 14,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  searchInput: {
    flex: '1 1 280px',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1.5px solid #DFD5C8',
    fontSize: 14,
  },
  chips: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  chip: {
    padding: '8px 14px',
    borderRadius: 999,
    border: '1.5px solid #D4A574',
    background: '#fff',
    color: '#6B4F2E',
    fontWeight: 600,
    fontSize: 13,
    cursor: 'pointer',
  },
  chipActive: { background: '#8B5A2B', color: '#fff', borderColor: '#8B5A2B' },
  emptyBox: {
    background: '#fff',
    padding: 40,
    borderRadius: 12,
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: 20,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    boxShadow: '0 2px 6px rgba(0,0,0,.07)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  imgWrap: {
    width: '100%',
    aspectRatio: '8 / 5',
    background: '#EDE6DD',
    position: 'relative',
  },
  img: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  catBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    background: 'rgba(59,47,47,0.86)',
    color: '#FAF7F2',
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
  },
  stockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 10px',
    borderRadius: 999,
  },
  cardBody: {
    padding: '16px 18px 18px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  name: { margin: '0 0 6px', color: '#3B2F2F', fontSize: 17 },
  metaLine: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    fontSize: 12,
    color: '#8a7f75',
    marginBottom: 4,
  },
  desc: {
    margin: '8px 0 16px',
    color: '#6d6157',
    fontSize: 13,
    lineHeight: 1.5,
    flex: 1,
  },
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 10,
    borderTop: '1px solid #F0E7DC',
  },
  price: { color: '#8B5A2B', fontWeight: 800, fontSize: 18 },
  quoteBtn: {
    background: '#F0E7DC',
    color: '#6B4F2E',
    border: '1px solid #D4A574',
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    textDecoration: 'none',
  },
  buyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    background: '#8B5A2B',
    color: '#FAF7F2',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 700,
  },
  adminBar: {
    display: 'flex',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px dashed #E5DCD0',
  },
  editSmallBtn: {
    flex: 1,
    background: '#FAF7F2',
    border: '1px solid #D4A574',
    color: '#3B2F2F',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  delSmallBtn: {
    background: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#991B1B',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  woods: { marginTop: 56 },
  h2: { color: '#3B2F2F', fontSize: 22, margin: '0 0 20px' },
  woodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: 12,
  },
  woodCard: {
    background: '#fff',
    borderRadius: 10,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    boxShadow: '0 1px 3px rgba(0,0,0,.06)',
  },
  tag: {
    alignSelf: 'flex-start',
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#8B5A2B',
    background: '#F0E7DC',
    padding: '3px 8px',
    borderRadius: 10,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  drawer: {
    background: '#FAF7F2',
    width: 'min(480px, 100vw)',
    height: '100vh',
    overflowY: 'auto',
    padding: 22,
    boxSizing: 'border-box',
    boxShadow: '-6px 0 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  drawerHead: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #E5DCD0',
    paddingBottom: 12,
  },
  closeBtn: {
    border: 'none',
    background: '#EDE4D8',
    width: 34,
    height: 34,
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: 15,
  },
  successBox: {
    background: '#DCFCE7',
    color: '#166534',
    padding: 14,
    borderRadius: 10,
    fontSize: 13.5,
  },
  checkoutForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  cartList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    background: '#fff',
    padding: 12,
    borderRadius: 10,
    border: '1px solid #EDE4D8',
  },
  cartRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
  },
  qtyControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 6,
    border: '1px solid #D4A574',
    background: '#FAF7F2',
    cursor: 'pointer',
    fontWeight: 700,
  },
  totalBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F0E7DC',
    padding: '12px 14px',
    borderRadius: 10,
    fontWeight: 600,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  label: {
    fontSize: 12.5,
    fontWeight: 700,
    color: '#3B2F2F',
  },
  input: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1.5px solid #DFD5C8',
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    width: '100%',
  },
  paySubmitBtn: {
    background: '#8B5A2B',
    color: '#fff',
    border: 'none',
    padding: '13px 18px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
    marginTop: 6,
  },
};
