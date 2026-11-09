var jl = Object.defineProperty;
var Fl = (l, e, t) => e in l ? jl(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var pt = (l, e, t) => Fl(l, typeof e != "symbol" ? e + "" : e, t);
function K() {
}
function dl(l) {
  return l();
}
function Dt() {
  return /* @__PURE__ */ Object.create(null);
}
function we(l) {
  l.forEach(dl);
}
function pl(l) {
  return typeof l == "function";
}
function _l(l, e) {
  return l != l ? e == e : l !== e || l && typeof l == "object" || typeof l == "function";
}
let it;
function Nt(l, e) {
  return l === e ? !0 : (it || (it = document.createElement("a")), it.href = e, l === it.href);
}
function ql(l) {
  return Object.keys(l).length === 0;
}
function u(l, e) {
  l.appendChild(e);
}
function m(l, e, t) {
  l.insertBefore(e, t || null);
}
function _(l) {
  l.parentNode && l.parentNode.removeChild(l);
}
function tt(l, e) {
  for (let t = 0; t < l.length; t += 1)
    l[t] && l[t].d(e);
}
function p(l) {
  return document.createElement(l);
}
function B(l) {
  return document.createElementNS("http://www.w3.org/2000/svg", l);
}
function N(l) {
  return document.createTextNode(l);
}
function M() {
  return N(" ");
}
function Ae() {
  return N("");
}
function X(l, e, t, n) {
  return l.addEventListener(e, t, n), () => l.removeEventListener(e, t, n);
}
function Bl(l) {
  return function(e) {
    return e.preventDefault(), l.call(this, e);
  };
}
function Hl(l) {
  return function(e) {
    e.target === this && l.call(this, e);
  };
}
function a(l, e, t) {
  t == null ? l.removeAttribute(e) : l.getAttribute(e) !== t && l.setAttribute(e, t);
}
function Ve(l) {
  return l === "" ? null : +l;
}
function Gl(l) {
  return Array.from(l.childNodes);
}
function te(l, e) {
  e = "" + e, l.data !== e && (l.data = /** @type {string} */
  e);
}
function ve(l, e) {
  l.value = e ?? "";
}
function ke(l, e, t, n) {
  t == null ? l.style.removeProperty(e) : l.style.setProperty(e, t, "");
}
function st(l, e, t) {
  for (let n = 0; n < l.options.length; n += 1) {
    const r = l.options[n];
    if (r.__value === e) {
      r.selected = !0;
      return;
    }
  }
  (!t || e !== void 0) && (l.selectedIndex = -1);
}
function Tt(l) {
  const e = l.querySelector(":checked");
  return e && e.__value;
}
function ne(l, e, t) {
  l.classList.toggle(e, !!t);
}
let lt;
function et(l) {
  lt = l;
}
function ml() {
  if (!lt) throw new Error("Function called outside component initialization");
  return lt;
}
function Ul(l) {
  ml().$$.on_mount.push(l);
}
function Vl(l) {
  ml().$$.on_destroy.push(l);
}
const Ue = [], mt = [];
let We = [];
const St = [], Wl = /* @__PURE__ */ Promise.resolve();
let ht = !1;
function Yl() {
  ht || (ht = !0, Wl.then(hl));
}
function nt(l) {
  We.push(l);
}
const _t = /* @__PURE__ */ new Set();
let Ge = 0;
function hl() {
  if (Ge !== 0)
    return;
  const l = lt;
  do {
    try {
      for (; Ge < Ue.length; ) {
        const e = Ue[Ge];
        Ge++, et(e), Jl(e.$$);
      }
    } catch (e) {
      throw Ue.length = 0, Ge = 0, e;
    }
    for (et(null), Ue.length = 0, Ge = 0; mt.length; ) mt.pop()();
    for (let e = 0; e < We.length; e += 1) {
      const t = We[e];
      _t.has(t) || (_t.add(t), t());
    }
    We.length = 0;
  } while (Ue.length);
  for (; St.length; )
    St.pop()();
  ht = !1, _t.clear(), et(l);
}
function Jl(l) {
  if (l.fragment !== null) {
    l.update(), we(l.before_update);
    const e = l.dirty;
    l.dirty = [-1], l.fragment && l.fragment.p(l.ctx, e), l.after_update.forEach(nt);
  }
}
function Kl(l) {
  const e = [], t = [];
  We.forEach((n) => l.indexOf(n) === -1 ? e.push(n) : t.push(n)), t.forEach((n) => n()), We = e;
}
const ct = /* @__PURE__ */ new Set();
let je;
function ce() {
  je = {
    r: 0,
    c: [],
    p: je
    // parent group
  };
}
function ue() {
  je.r || we(je.c), je = je.p;
}
function C(l, e) {
  l && l.i && (ct.delete(l), l.i(e));
}
function A(l, e, t, n) {
  if (l && l.o) {
    if (ct.has(l)) return;
    ct.add(l), je.c.push(() => {
      ct.delete(l), n && (t && l.d(1), n());
    }), l.o(e);
  } else n && n();
}
function de(l) {
  return (l == null ? void 0 : l.length) !== void 0 ? l : Array.from(l);
}
function Ql(l, e) {
  l.d(1), e.delete(l.key);
}
function gt(l, e) {
  A(l, 1, 1, () => {
    e.delete(l.key);
  });
}
function dt(l, e, t, n, r, o, i, s, c, f, h, g) {
  let v = l.length, d = o.length, y = v;
  const S = {};
  for (; y--; ) S[l[y].key] = y;
  const D = [], z = /* @__PURE__ */ new Map(), I = /* @__PURE__ */ new Map(), k = [];
  for (y = d; y--; ) {
    const b = g(r, o, y), w = t(b);
    let L = i.get(w);
    L ? k.push(() => L.p(b, e)) : (L = f(w, b), L.c()), z.set(w, D[y] = L), w in S && I.set(w, Math.abs(y - S[w]));
  }
  const E = /* @__PURE__ */ new Set(), T = /* @__PURE__ */ new Set();
  function P(b) {
    C(b, 1), b.m(s, h), i.set(b.key, b), h = b.first, d--;
  }
  for (; v && d; ) {
    const b = D[d - 1], w = l[v - 1], L = b.key, W = w.key;
    b === w ? (h = b.first, v--, d--) : z.has(W) ? !i.has(L) || E.has(L) ? P(b) : T.has(W) ? v-- : I.get(L) > I.get(W) ? (T.add(L), P(b)) : (E.add(W), v--) : (c(w, i), v--);
  }
  for (; v--; ) {
    const b = l[v];
    z.has(b.key) || c(b, i);
  }
  for (; d; ) P(D[d - 1]);
  return we(k), D;
}
function ie(l) {
  l && l.c();
}
function re(l, e, t) {
  const { fragment: n, after_update: r } = l.$$;
  n && n.m(e, t), nt(() => {
    const o = l.$$.on_mount.map(dl).filter(pl);
    l.$$.on_destroy ? l.$$.on_destroy.push(...o) : we(o), l.$$.on_mount = [];
  }), r.forEach(nt);
}
function oe(l, e) {
  const t = l.$$;
  t.fragment !== null && (Kl(t.after_update), we(t.on_destroy), t.fragment && t.fragment.d(e), t.on_destroy = t.fragment = null, t.ctx = []);
}
function Zl(l, e) {
  l.$$.dirty[0] === -1 && (Ue.push(l), Yl(), l.$$.dirty.fill(0)), l.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function yl(l, e, t, n, r, o, i = null, s = [-1]) {
  const c = lt;
  et(l);
  const f = l.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: o,
    update: K,
    not_equal: r,
    bound: Dt(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(e.context || (c ? c.$$.context : [])),
    // everything else
    callbacks: Dt(),
    dirty: s,
    skip_bound: !1,
    root: e.target || c.$$.root
  };
  i && i(f.root);
  let h = !1;
  if (f.ctx = t ? t(l, e.props || {}, (g, v, ...d) => {
    const y = d.length ? d[0] : v;
    return f.ctx && r(f.ctx[g], f.ctx[g] = y) && (!f.skip_bound && f.bound[g] && f.bound[g](y), h && Zl(l, g)), v;
  }) : [], f.update(), h = !0, we(f.before_update), f.fragment = n ? n(f.ctx) : !1, e.target) {
    if (e.hydrate) {
      const g = Gl(e.target);
      f.fragment && f.fragment.l(g), g.forEach(_);
    } else
      f.fragment && f.fragment.c();
    e.intro && C(l.$$.fragment), re(l, e.target, e.anchor), hl();
  }
  et(c);
}
class vl {
  constructor() {
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    pt(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    pt(this, "$$set");
  }
  /** @returns {void} */
  $destroy() {
    oe(this, 1), this.$destroy = K;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(e, t) {
    if (!pl(t))
      return K;
    const n = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
    return n.push(t), () => {
      const r = n.indexOf(t);
      r !== -1 && n.splice(r, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(e) {
    this.$$set && !ql(e) && (this.$$.skip_bound = !0, this.$$set(e), this.$$.skip_bound = !1);
  }
}
const Xl = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(Xl);
const kl = typeof window < "u" ? window.location.hostname : "localhost", xl = typeof window < "u" && window.location.protocol === "https:", en = kl.replace(/^(www|admin|taller|api)\./, ""), wt = xl ? `https://api.${en}` : `http://${kl}:3000`, rt = `${wt}/api`, tn = `${wt}/api/ai`, ln = `${wt}/graphql`, yt = "carpinteria_force_offline", qe = "carpinteria_net_failed", vt = "carpinteria:network-change", pe = {
  carpenters: "carpinteria_taller_cache_carpenters",
  orders: "carpinteria_taller_cache_orders",
  deliveries: "carpinteria_taller_cache_deliveries",
  products: "carpinteria_cache_products"
}, at = {
  id: "1",
  name: "Roberto Quispe (Maestro Ebanista)",
  email: "carpintero@carpinteria.com"
}, Et = [
  {
    id: "101",
    description: "Mesa de Comedor Imperial 8 personas en Roble",
    status: "IN_PRODUCTION",
    deliveryDate: "2026-11-05",
    client: { name: "Carlos Mendoza" },
    items: [{ description: "Mesa Comedor 240x110cm", quantity: 1, furnitureType: "TABLE", woodType: "ROBLE" }],
    steps: [
      { id: "1001", name: "Corte y cepillado de madera", status: "COMPLETED", sequence: 1 },
      { id: "1002", name: "Ensamblado y espigado", status: "IN_PROGRESS", sequence: 2 },
      { id: "1003", name: "Lijado y barnizado poliuretano", status: "PENDING", sequence: 3 }
    ],
    delivery: {
      scheduledDate: "2026-11-05",
      timeSlot: "MORNING",
      status: "SCHEDULED",
      address: "Av. Banzer 4to Anillo, Santa Cruz",
      deliveryType: "DELIVERY",
      latitude: -17.754,
      longitude: -63.178
    },
    deliveryType: "DELIVERY",
    deliveryAddress: "Av. Banzer 4to Anillo, Santa Cruz",
    deliveryLat: -17.754,
    deliveryLng: -63.178
  },
  {
    id: "102",
    description: "Ropero Empotrado 3 Cuerpos en Mara",
    status: "PENDING",
    deliveryDate: "2026-11-10",
    client: { name: "María Fernanda Suárez" },
    items: [{ description: "Ropero 3 cuerpos con espejos", quantity: 1, furnitureType: "WARDROBE", woodType: "MARA" }],
    steps: [
      { id: "1004", name: "Corte de paneles de Mara", status: "PENDING", sequence: 1 },
      { id: "1005", name: "Armado de cajoneras y rieles", status: "PENDING", sequence: 2 }
    ],
    delivery: {
      scheduledDate: "2026-11-10",
      timeSlot: "AFTERNOON",
      status: "SCHEDULED",
      address: "Equipetrol Calle 7 #120",
      deliveryType: "DELIVERY",
      latitude: -17.762,
      longitude: -63.195
    },
    deliveryType: "DELIVERY",
    deliveryAddress: "Equipetrol Calle 7 #120",
    deliveryLat: -17.762,
    deliveryLng: -63.195
  }
], Ye = [
  {
    id: "prod-1",
    name: "Mesa de Comedor Imperial 8 Personas",
    category: "Mesas",
    woodType: "Roble",
    dimensions: "240 x 110 x 76 cm",
    price: 3600,
    estimatedDays: 10,
    stock: 3,
    description: "Mesa maciza de roble boliviano secado al horno con acabado poliuretano mate.",
    iconName: "table_restaurant",
    carpenterEmail: "carpintero@carpinteria.com",
    carpenterName: "Roberto Quispe (Maestro Ebanista)"
  },
  {
    id: "prod-4",
    name: "Silla de Comedor Ergonómica Tapizada",
    category: "Sillas",
    woodType: "Roble",
    dimensions: "48 x 52 x 92 cm",
    price: 680,
    estimatedDays: 5,
    stock: 12,
    description: "Estructura espigada en roble con asiento tapizado en lino antimanchas.",
    iconName: "chair",
    carpenterEmail: "carpintero@carpinteria.com",
    carpenterName: "Roberto Quispe (Maestro Ebanista)"
  }
];
function Je() {
  typeof window < "u" && window.dispatchEvent(new CustomEvent(vt));
}
function bl() {
  return typeof localStorage < "u" && localStorage.getItem(yt) === "1";
}
function Ne() {
  return typeof window > "u" ? !1 : !!(bl() || !navigator.onLine || sessionStorage.getItem(qe) === "1");
}
function nn(l) {
  !bl() ? localStorage.setItem(yt, "1") : (localStorage.removeItem(yt), sessionStorage.removeItem(qe)), Je();
}
function rn(l) {
  if (typeof window > "u") return () => {
  };
  const e = () => l();
  return window.addEventListener(vt, e), window.addEventListener("online", e), window.addEventListener("offline", e), window.addEventListener("storage", e), () => {
    window.removeEventListener(vt, e), window.removeEventListener("online", e), window.removeEventListener("offline", e), window.removeEventListener("storage", e);
  };
}
function Te(l, e) {
  try {
    const t = localStorage.getItem(l);
    if (!t)
      return localStorage.setItem(l, JSON.stringify(e)), e;
    const n = JSON.parse(t);
    return Array.isArray(n) && n.length > 0 ? n : e;
  } catch {
    return e;
  }
}
function Ie(l, e) {
  try {
    Array.isArray(e) && e.length > 0 && localStorage.setItem(l, JSON.stringify(e));
  } catch {
  }
}
function Be() {
  const l = localStorage.getItem("carpinteria_token") ?? (() => {
    try {
      return JSON.parse(localStorage.getItem("carpinteria_session") ?? "{}").token;
    } catch {
      return null;
    }
  })();
  return { "Content-Type": "application/json", ...l ? { Authorization: `Bearer ${l}` } : {} };
}
async function $t(l, e = {}) {
  if (Ne()) throw new Error("OFFLINE_MODE");
  const t = await fetch(ln, { method: "POST", headers: Be(), body: JSON.stringify({ query: l, variables: e }) });
  return sessionStorage.removeItem(qe), Je(), t.json();
}
async function on(l) {
  var e;
  try {
    const n = ((e = (await $t("{ carpenters { id name email } }")).data) == null ? void 0 : e.carpenters) ?? [];
    Ie(pe.carpenters, n);
    const r = n.find(
      (o) => {
        var i;
        return ((i = o.email) == null ? void 0 : i.toLowerCase()) === l.toLowerCase();
      }
    );
    return r ? { id: r.id, name: r.name } : { id: at.id, name: l.split("@")[0] || at.name };
  } catch {
    sessionStorage.setItem(qe, "1"), Je();
    const t = Te(pe.carpenters, [at]), n = t.find((r) => {
      var o;
      return ((o = r.email) == null ? void 0 : o.toLowerCase()) === l.toLowerCase();
    }) ?? t[0] ?? at;
    return { id: String(n.id), name: n.name };
  }
}
async function sn(l) {
  var e;
  try {
    const n = ((e = (await $t(
      `query($id: ID!) {
        carpenterWorkload(carpenterId: $id) {
          id description status deliveryDate
          client { name }
          items { description quantity furnitureType woodType }
          steps { id name status sequence }
          delivery { scheduledDate timeSlot status address deliveryType latitude longitude }
          deliveryType deliveryAddress deliveryLat deliveryLng
        }
      }`,
      { id: l }
    )).data) == null ? void 0 : e.carpenterWorkload) ?? [];
    return n.length > 0 && Ie(pe.orders, n), n;
  } catch {
    return sessionStorage.setItem(qe, "1"), Je(), Te(pe.orders, Et);
  }
}
async function an(l, e) {
  var t, n, r;
  try {
    const o = await $t(
      "mutation($id: ID!, $status: StepStatus!) { updateStepStatus(stepId: $id, status: $status) { id status } }",
      { id: l, status: e }
    );
    return ((t = o.data) == null ? void 0 : t.updateStepStatus) ?? { error: (r = (n = o.errors) == null ? void 0 : n[0]) == null ? void 0 : r.message };
  } catch {
    sessionStorage.setItem(qe, "1"), Je();
    const o = Te(pe.orders, Et).map((i) => ({
      ...i,
      steps: (i.steps ?? []).map((s) => String(s.id) === String(l) ? { ...s, status: e } : s)
    }));
    return Ie(pe.orders, o), { id: l, status: e, offline: !0 };
  }
}
function Mt(l) {
  var o, i, s;
  const e = l.toLowerCase(), t = Te(pe.orders, Et), n = Te(pe.products, Ye), r = t.filter((c) => !["DELIVERED", "CANCELLED"].includes(c.status));
  if (e.includes("hacer hoy") || e.includes("trabajo") || e.includes("pendiente") || e.includes("paso")) {
    if (r.length === 0)
      return { source: "local-ai", answer: "[IA Local Taller] ¡Felicidades! No tienes pedidos pendientes por fabricar hoy." };
    const c = r.map((f) => {
      var g;
      const h = (f.steps ?? []).find((v) => v.status !== "COMPLETED");
      return `• Pedido #${f.id} (${f.description}) para ${((g = f.client) == null ? void 0 : g.name) ?? "Cliente"} → Siguiente paso: ${(h == null ? void 0 : h.name) ?? "Listo para entregar"}`;
    });
    return {
      source: "local-ai",
      answer: `[IA Local Taller — Sin Internet]
Tienes ${r.length} trabajo(s) activos en tu banco de carpintería:
${c.join(`
`)}`
    };
  }
  if (e.includes("entrega") || e.includes("cuándo") || e.includes("cuando") || e.includes("dónde") || e.includes("donde") || e.includes("dirección") || e.includes("direccion")) {
    const c = r.filter((v) => {
      var d;
      return ((d = v.delivery) == null ? void 0 : d.scheduledDate) || v.deliveryDate;
    });
    if (c.length === 0)
      return { source: "local-ai", answer: "[IA Local Taller] Ninguno de tus pedidos activos tiene fecha de entrega programada todavía." };
    const f = c[0], h = ((o = f.delivery) == null ? void 0 : o.address) ?? f.deliveryAddress ?? "Recojo en taller", g = ((i = f.delivery) == null ? void 0 : i.scheduledDate) ?? f.deliveryDate;
    return {
      source: "local-ai",
      answer: `[IA Local Taller — Sin Internet]
Tu próxima entrega es el pedido #${f.id} (${f.description}):
• Fecha: ${g}
• Cliente: ${((s = f.client) == null ? void 0 : s.name) ?? "Cliente"}
• Destino: ${h}`
    };
  }
  return {
    source: "local-ai",
    answer: `[IA Local Taller — Modo Offline Activo]
Resumen local en este dispositivo:
• ${r.length} pedido(s) en fabricación
• ${n.length} mueble(s) publicados en el Marketplace
Pregúntame qué tienes que hacer hoy o a dónde debes llevar tu próxima entrega.`
  };
}
async function cn(l, e = !1) {
  if (e || Ne())
    return Mt(l);
  try {
    const t = localStorage.getItem("agent_session") ?? (() => {
      const r = crypto.randomUUID();
      return localStorage.setItem("agent_session", r), r;
    })(), n = await fetch(`${tn}/agent`, {
      method: "POST",
      headers: Be(),
      body: JSON.stringify({ query: l, session_id: t })
    });
    if (!n.ok) throw new Error("status");
    return n.json();
  } catch {
    return sessionStorage.setItem(qe, "1"), Je(), Mt(l);
  }
}
async function un() {
  try {
    if (Ne()) throw new Error("OFFLINE_MODE");
    const l = await fetch(`${rt}/products`, { headers: Be() });
    if (!l.ok) throw new Error("status");
    const e = await l.json();
    return Ie(pe.products, e), e;
  } catch {
    return Te(pe.products, Ye);
  }
}
async function fn(l) {
  try {
    if (Ne()) throw new Error("OFFLINE_MODE");
    const e = await fetch(`${rt}/products`, {
      method: "POST",
      headers: Be(),
      body: JSON.stringify(l)
    });
    if (!e.ok) throw new Error("No se pudo publicar el mueble");
    const t = await e.json();
    return Ie(pe.products, [t, ...Te(pe.products, Ye)]), t;
  } catch {
    const e = {
      id: `taller-${Date.now()}`,
      name: l.name,
      category: l.category,
      woodType: l.woodType,
      dimensions: l.dimensions,
      price: l.price,
      estimatedDays: l.estimatedDays ?? 10,
      stock: l.stock,
      description: l.description,
      iconName: "table_restaurant",
      imageUrl: l.imageUrl,
      carpenterEmail: l.carpenterEmail,
      carpenterName: l.carpenterName
    };
    return Ie(pe.products, [e, ...Te(pe.products, Ye)]), e;
  }
}
async function dn(l, e) {
  try {
    if (Ne()) throw new Error("OFFLINE_MODE");
    const t = await fetch(`${rt}/products/${l}`, {
      method: "PUT",
      headers: Be(),
      body: JSON.stringify(e)
    });
    if (!t.ok) throw new Error("No se pudo actualizar el mueble");
    return t.json();
  } catch {
    const t = Te(pe.products, Ye).map((n) => n.id === l ? { ...n, ...e } : n);
    return Ie(pe.products, t), t.find((n) => n.id === l);
  }
}
async function pn(l) {
  try {
    if (Ne()) throw new Error("OFFLINE_MODE");
    if (!(await fetch(`${rt}/products/${l}`, {
      method: "DELETE",
      headers: Be()
    })).ok) throw new Error("No se pudo eliminar el mueble");
  } catch {
    Ie(
      pe.products,
      Te(pe.products, Ye).filter((e) => e.id !== l)
    );
  }
}
async function _n(l, e = "marketplace") {
  const t = await new Promise((n, r) => {
    const o = new FileReader();
    o.onload = () => n(o.result), o.onerror = r, o.readAsDataURL(l);
  });
  try {
    if (Ne()) throw new Error("OFFLINE_MODE");
    const n = t.split(",")[1], r = await fetch(`${rt}/uploads/s3`, {
      method: "POST",
      headers: Be(),
      body: JSON.stringify({
        fileName: l.name,
        mimeType: l.type || "image/jpeg",
        base64: n,
        folder: e
      })
    });
    if (!r.ok) throw new Error("Error al subir imagen a S3");
    return (await r.json()).url;
  } catch {
    return t;
  }
}
const ut = "carpinteria_session", mn = typeof window < "u" ? window.location.hostname : "localhost";
mn.replace(/^(www|admin|taller|api)\./, "");
function hn(l) {
  try {
    return JSON.parse(atob(l.split(".")[1])).role ?? "CLIENT";
  } catch {
    return "CLIENT";
  }
}
function kt() {
  try {
    const l = localStorage.getItem(ut);
    if (!l) return null;
    const e = JSON.parse(l), t = JSON.parse(atob(e.token.split(".")[1])).exp;
    return t && t * 1e3 < Date.now() ? (localStorage.removeItem(ut), null) : e;
  } catch {
    return null;
  }
}
function yn() {
  const l = new URLSearchParams(window.location.search), e = l.get("token");
  if (!e) return;
  const t = { token: e, email: l.get("email") ?? "", role: hn(e) };
  localStorage.setItem(ut, JSON.stringify(t)), l.delete("token"), l.delete("email");
  const n = l.toString();
  window.history.replaceState({}, "", window.location.pathname + (n ? `?${n}` : ""));
}
function vn() {
  const l = kt();
  return !!l && (l.role === "CARPENTER" || l.role === "ADMIN");
}
function kn() {
  localStorage.removeItem(ut);
}
function bn(l) {
  let e;
  return {
    c() {
      e = B("polygon"), a(e, "points", "3 11 22 2 13 21 11 13 3 11");
    },
    m(t, n) {
      m(t, e, n);
    },
    d(t) {
      t && _(e);
    }
  };
}
function gn(l) {
  let e, t, n, r, o;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), r = B("path"), o = B("path"), a(e, "d", "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"), a(t, "d", "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"), a(n, "d", "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"), a(r, "d", "M2 7h20"), a(o, "d", "M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7");
    },
    m(i, s) {
      m(i, e, s), m(i, t, s), m(i, n, s), m(i, r, s), m(i, o, s);
    },
    d(i) {
      i && (_(e), _(t), _(n), _(r), _(o));
    }
  };
}
function wn(l) {
  let e, t, n, r, o, i, s, c;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), r = B("path"), o = B("path"), i = B("path"), s = B("path"), c = B("path"), a(e, "d", "M5.8 11.3 2 22l10.7-3.79"), a(t, "d", "M4 3h.01"), a(n, "d", "M22 8h.01"), a(r, "d", "M15 2h.01"), a(o, "d", "M22 20h.01"), a(i, "d", "m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"), a(s, "d", "m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"), a(c, "d", "m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7");
    },
    m(f, h) {
      m(f, e, h), m(f, t, h), m(f, n, h), m(f, r, h), m(f, o, h), m(f, i, h), m(f, s, h), m(f, c, h);
    },
    d(f) {
      f && (_(e), _(t), _(n), _(r), _(o), _(i), _(s), _(c));
    }
  };
}
function En(l) {
  let e, t;
  return {
    c() {
      e = B("path"), t = B("line"), a(e, "d", "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"), a(t, "x1", "4"), a(t, "y1", "22"), a(t, "x2", "4"), a(t, "y2", "15");
    },
    m(n, r) {
      m(n, e, r), m(n, t, r);
    },
    d(n) {
      n && (_(e), _(t));
    }
  };
}
function $n(l) {
  let e, t;
  return {
    c() {
      e = B("path"), t = B("circle"), a(e, "d", "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"), a(t, "cx", "12"), a(t, "cy", "7"), a(t, "r", "4");
    },
    m(n, r) {
      m(n, e, r), m(n, t, r);
    },
    d(n) {
      n && (_(e), _(t));
    }
  };
}
function Dn(l) {
  let e, t, n;
  return {
    c() {
      e = B("rect"), t = B("path"), n = B("path"), a(e, "x", "8"), a(e, "y", "2"), a(e, "width", "8"), a(e, "height", "4"), a(e, "rx", "1"), a(t, "d", "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"), a(n, "d", "M12 11h4M12 16h4M8 11h.01M8 16h.01");
    },
    m(r, o) {
      m(r, e, o), m(r, t, o), m(r, n, o);
    },
    d(r) {
      r && (_(e), _(t), _(n));
    }
  };
}
function Nn(l) {
  let e, t, n;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), a(e, "d", "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"), a(t, "d", "M16 17l5-5-5-5"), a(n, "d", "M21 12H9");
    },
    m(r, o) {
      m(r, e, o), m(r, t, o), m(r, n, o);
    },
    d(r) {
      r && (_(e), _(t), _(n));
    }
  };
}
function Tn(l) {
  let e;
  return {
    c() {
      e = B("polygon"), a(e, "points", "6 3 20 12 6 21 6 3");
    },
    m(t, n) {
      m(t, e, n);
    },
    d(t) {
      t && _(e);
    }
  };
}
function Sn(l) {
  let e, t, n;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), a(e, "d", "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z"), a(t, "d", "M12 9v4"), a(n, "d", "M12 17h.01");
    },
    m(r, o) {
      m(r, e, o), m(r, t, o), m(r, n, o);
    },
    d(r) {
      r && (_(e), _(t), _(n));
    }
  };
}
function Mn(l) {
  let e, t;
  return {
    c() {
      e = B("path"), t = B("circle"), a(e, "d", "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"), a(t, "cx", "12"), a(t, "cy", "10"), a(t, "r", "3");
    },
    m(n, r) {
      m(n, e, r), m(n, t, r);
    },
    d(n) {
      n && (_(e), _(t));
    }
  };
}
function Ln(l) {
  let e;
  return {
    c() {
      e = B("path"), a(e, "d", "M7.9 20A9 9 0 1 0 4 16.1L2 22z");
    },
    m(t, n) {
      m(t, e, n);
    },
    d(t) {
      t && _(e);
    }
  };
}
function Cn(l) {
  let e, t;
  return {
    c() {
      e = B("circle"), t = B("path"), a(e, "cx", "12"), a(e, "cy", "12"), a(e, "r", "10"), a(t, "d", "M12 6v6l4 2");
    },
    m(n, r) {
      m(n, e, r), m(n, t, r);
    },
    d(n) {
      n && (_(e), _(t));
    }
  };
}
function In(l) {
  let e, t;
  return {
    c() {
      e = B("circle"), t = B("path"), a(e, "cx", "12"), a(e, "cy", "12"), a(e, "r", "10"), a(t, "d", "m9 12 2 2 4-4");
    },
    m(n, r) {
      m(n, e, r), m(n, t, r);
    },
    d(n) {
      n && (_(e), _(t));
    }
  };
}
function An(l) {
  let e;
  return {
    c() {
      e = B("polyline"), a(e, "points", "20 6 9 17 4 12");
    },
    m(t, n) {
      m(t, e, n);
    },
    d(t) {
      t && _(e);
    }
  };
}
function On(l) {
  let e, t;
  return {
    c() {
      e = B("rect"), t = B("path"), a(e, "x", "3"), a(e, "y", "4"), a(e, "width", "18"), a(e, "height", "18"), a(e, "rx", "2"), a(t, "d", "M16 2v4M8 2v4M3 10h18");
    },
    m(n, r) {
      m(n, e, r), m(n, t, r);
    },
    d(n) {
      n && (_(e), _(t));
    }
  };
}
function Pn(l) {
  let e, t, n, r, o;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), r = B("circle"), o = B("circle"), a(e, "d", "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"), a(t, "d", "M15 18h-5"), a(n, "d", "M14 9h4l4 4v4a1 1 0 0 1-1 1h-2"), a(r, "cx", "17"), a(r, "cy", "18"), a(r, "r", "2"), a(o, "cx", "7"), a(o, "cy", "18"), a(o, "r", "2");
    },
    m(i, s) {
      m(i, e, s), m(i, t, s), m(i, n, s), m(i, r, s), m(i, o, s);
    },
    d(i) {
      i && (_(e), _(t), _(n), _(r), _(o));
    }
  };
}
function Rn(l) {
  let e, t, n;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), a(e, "d", "m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"), a(t, "d", "m18 15 4-4"), a(n, "d", "m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5");
    },
    m(r, o) {
      m(r, e, o), m(r, t, o), m(r, n, o);
    },
    d(r) {
      r && (_(e), _(t), _(n));
    }
  };
}
function zn(l) {
  let e;
  function t(o, i) {
    if (
      /*name*/
      o[0] === "hammer"
    ) return Rn;
    if (
      /*name*/
      o[0] === "truck"
    ) return Pn;
    if (
      /*name*/
      o[0] === "calendar"
    ) return On;
    if (
      /*name*/
      o[0] === "check"
    ) return An;
    if (
      /*name*/
      o[0] === "check-circle"
    ) return In;
    if (
      /*name*/
      o[0] === "clock"
    ) return Cn;
    if (
      /*name*/
      o[0] === "chat"
    ) return Ln;
    if (
      /*name*/
      o[0] === "pin"
    ) return Mn;
    if (
      /*name*/
      o[0] === "alert"
    ) return Sn;
    if (
      /*name*/
      o[0] === "play"
    ) return Tn;
    if (
      /*name*/
      o[0] === "logout"
    ) return Nn;
    if (
      /*name*/
      o[0] === "clipboard"
    ) return Dn;
    if (
      /*name*/
      o[0] === "user"
    ) return $n;
    if (
      /*name*/
      o[0] === "flag"
    ) return En;
    if (
      /*name*/
      o[0] === "party"
    ) return wn;
    if (
      /*name*/
      o[0] === "store"
    ) return gn;
    if (
      /*name*/
      o[0] === "navigation"
    ) return bn;
  }
  let n = t(l), r = n && n(l);
  return {
    c() {
      e = B("svg"), r && r.c(), a(
        e,
        "width",
        /*size*/
        l[1]
      ), a(
        e,
        "height",
        /*size*/
        l[1]
      ), a(e, "viewBox", "0 0 24 24"), a(e, "fill", "none"), a(e, "stroke", "currentColor"), a(e, "stroke-width", "2"), a(e, "stroke-linecap", "round"), a(e, "stroke-linejoin", "round"), a(e, "aria-hidden", "true");
    },
    m(o, i) {
      m(o, e, i), r && r.m(e, null);
    },
    p(o, [i]) {
      n !== (n = t(o)) && (r && r.d(1), r = n && n(o), r && (r.c(), r.m(e, null))), i & /*size*/
      2 && a(
        e,
        "width",
        /*size*/
        o[1]
      ), i & /*size*/
      2 && a(
        e,
        "height",
        /*size*/
        o[1]
      );
    },
    i: K,
    o: K,
    d(o) {
      o && _(e), r && r.d();
    }
  };
}
function jn(l, e, t) {
  let { name: n } = e, { size: r = 20 } = e;
  return l.$$set = (o) => {
    "name" in o && t(0, n = o.name), "size" in o && t(1, r = o.size);
  }, [n, r];
}
class se extends vl {
  constructor(e) {
    super(), yl(this, e, jn, zn, _l, { name: 0, size: 1 });
  }
}
function Lt(l, e, t) {
  const n = l.slice();
  return n[77] = e[t], n;
}
function Ct(l, e, t) {
  const n = l.slice();
  return n[80] = e[t], n;
}
function It(l, e, t) {
  const n = l.slice();
  return n[77] = e[t], n;
}
function At(l, e, t) {
  const n = l.slice();
  return n[85] = e[t], n;
}
function Ot(l, e, t) {
  const n = l.slice();
  return n[95] = e[t], n;
}
function Fn(l) {
  const e = l.slice(), t = (
    /*o*/
    e[95].delivery.latitude ?? /*o*/
    e[95].deliveryLat
  );
  e[98] = t;
  const n = (
    /*o*/
    e[95].delivery.longitude ?? /*o*/
    e[95].deliveryLng
  );
  return e[99] = n, e;
}
function Pt(l, e, t) {
  const n = l.slice();
  n[95] = e[t];
  const r = Ke(
    /*o*/
    n[95]
  );
  n[100] = r;
  const o = wl(
    /*o*/
    n[95]
  );
  n[101] = o;
  const i = Er(
    /*o*/
    n[95]
  );
  return n[102] = i, n;
}
function Rt(l, e, t) {
  const n = l.slice();
  return n[88] = e[t], n[106] = t, n;
}
function zt(l, e, t) {
  const n = l.slice();
  return n[107] = e[t], n;
}
function jt(l, e, t) {
  const n = l.slice();
  return n[88] = e[t], n;
}
function qn(l) {
  const e = l.slice(), t = (
    /*siguienteAccion*/
    e[35]()
  );
  e[91] = t;
  const n = (
    /*activos*/
    e[38]().length
  );
  e[92] = n;
  const r = (
    /*totalPendientes*/
    e[37]()
  );
  e[93] = r;
  const o = (
    /*entregasProximas*/
    e[36]()
  );
  return e[94] = o, e;
}
function Bn(l) {
  let e, t, n, r, o, i, s, c, f, h, g, v, d, y, S, D, z, I = (
    /*isStandalone*/
    l[32] && Gn(l)
  ), k = (
    /*isStandalone*/
    l[32] && /*offline*/
    l[20] && Ft()
  );
  i = new se({ props: { name: "clipboard", size: 18 } }), h = new se({ props: { name: "store", size: 18 } });
  const E = [Yn, Wn, Vn, Un], T = [];
  function P(w, L) {
    return (
      /*tab*/
      w[0] === "marketplace" ? 0 : (
        /*cargando*/
        w[8] ? 1 : (
          /*error*/
          w[9] ? 2 : 3
        )
      )
    );
  }
  function b(w, L) {
    return L === 3 ? qn(w) : w;
  }
  return d = P(l), y = T[d] = E[d](b(l, d)), {
    c() {
      I && I.c(), e = M(), t = p("main"), k && k.c(), n = M(), r = p("div"), o = p("button"), ie(i.$$.fragment), s = N(" Mis trabajos"), c = M(), f = p("button"), ie(h.$$.fragment), g = N(" Muebles en venta"), v = M(), y.c(), a(o, "class", "tab svelte-ykyv02"), ne(
        o,
        "tab-on",
        /*tab*/
        l[0] === "trabajos"
      ), a(f, "class", "tab svelte-ykyv02"), ne(
        f,
        "tab-on",
        /*tab*/
        l[0] === "marketplace"
      ), a(r, "class", "tabs svelte-ykyv02"), a(t, "class", "svelte-ykyv02"), ne(
        t,
        "con-chat",
        /*chatAbierto*/
        l[15]
      );
    },
    m(w, L) {
      I && I.m(w, L), m(w, e, L), m(w, t, L), k && k.m(t, null), u(t, n), u(t, r), u(r, o), re(i, o, null), u(o, s), u(r, c), u(r, f), re(h, f, null), u(f, g), u(t, v), T[d].m(t, null), S = !0, D || (z = [
        X(
          o,
          "click",
          /*click_handler_1*/
          l[44]
        ),
        X(
          f,
          "click",
          /*click_handler_2*/
          l[45]
        )
      ], D = !0);
    },
    p(w, L) {
      /*isStandalone*/
      w[32] && I.p(w, L), /*isStandalone*/
      w[32] && /*offline*/
      w[20] ? k || (k = Ft(), k.c(), k.m(t, n)) : k && (k.d(1), k = null), (!S || L[0] & /*tab*/
      1) && ne(
        o,
        "tab-on",
        /*tab*/
        w[0] === "trabajos"
      ), (!S || L[0] & /*tab*/
      1) && ne(
        f,
        "tab-on",
        /*tab*/
        w[0] === "marketplace"
      );
      let W = d;
      d = P(w), d === W ? T[d].p(b(w, d), L) : (ce(), A(T[W], 1, 1, () => {
        T[W] = null;
      }), ue(), y = T[d], y ? y.p(b(w, d), L) : (y = T[d] = E[d](b(w, d)), y.c()), C(y, 1), y.m(t, null)), (!S || L[0] & /*chatAbierto*/
      32768) && ne(
        t,
        "con-chat",
        /*chatAbierto*/
        w[15]
      );
    },
    i(w) {
      S || (C(I), C(i.$$.fragment, w), C(h.$$.fragment, w), C(y), S = !0);
    },
    o(w) {
      A(I), A(i.$$.fragment, w), A(h.$$.fragment, w), A(y), S = !1;
    },
    d(w) {
      w && (_(e), _(t)), I && I.d(w), k && k.d(), oe(i), oe(h), T[d].d(), D = !1, we(z);
    }
  };
}
function Hn(l) {
  let e;
  return {
    c() {
      e = p("main"), e.innerHTML = '<section class="card svelte-ykyv02"><p class="big svelte-ykyv02">No puedes entrar aquí. Esta zona es solo para el taller.</p></section>', a(e, "class", "svelte-ykyv02");
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && _(e);
    }
  };
}
function Gn(l) {
  let e, t, n, r, o, i = (
    /*offline*/
    l[20] ? "⚡ Sin conexión · IA Local" : "● En línea"
  ), s, c, f, h, g, v, d, y, S, D, z, I, k;
  return S = new se({ props: { name: "logout", size: 15 } }), {
    c() {
      e = p("header"), t = p("div"), t.innerHTML = '<img src="/logo_el_roble.png" alt="El Roble" style="width:36px;height:36px;border-radius:8px;object-fit:cover"/> <strong class="svelte-ykyv02">Mi Taller — Carpintería El Roble</strong>', n = M(), r = p("div"), o = p("button"), s = N(i), c = M(), f = p("span"), h = N("Hola, "), g = p("b"), v = N(
        /*nombre*/
        l[11]
      ), d = M(), y = p("button"), ie(S.$$.fragment), D = N(" Salir"), a(t, "class", "brand svelte-ykyv02"), a(o, "class", "out svelte-ykyv02"), ke(
        o,
        "background",
        /*offline*/
        l[20] ? "#fef3c7" : "#dcfce7"
      ), ke(
        o,
        "color",
        /*offline*/
        l[20] ? "#92400e" : "#166534"
      ), ke(
        o,
        "border-color",
        /*offline*/
        l[20] ? "#f59e0b" : "#86efac"
      ), ke(o, "font-weight", "700"), a(f, "class", "hola svelte-ykyv02"), a(y, "class", "out svelte-ykyv02"), a(r, "class", "who svelte-ykyv02"), a(e, "class", "topbar svelte-ykyv02");
    },
    m(E, T) {
      m(E, e, T), u(e, t), u(e, n), u(e, r), u(r, o), u(o, s), u(r, c), u(r, f), u(f, h), u(f, g), u(g, v), u(r, d), u(r, y), re(S, y, null), u(y, D), z = !0, I || (k = [
        X(
          o,
          "click",
          /*click_handler*/
          l[43]
        ),
        X(
          y,
          "click",
          /*salir*/
          l[41]
        )
      ], I = !0);
    },
    p(E, T) {
      (!z || T[0] & /*offline*/
      1048576) && i !== (i = /*offline*/
      E[20] ? "⚡ Sin conexión · IA Local" : "● En línea") && te(s, i), (!z || T[0] & /*offline*/
      1048576) && ke(
        o,
        "background",
        /*offline*/
        E[20] ? "#fef3c7" : "#dcfce7"
      ), (!z || T[0] & /*offline*/
      1048576) && ke(
        o,
        "color",
        /*offline*/
        E[20] ? "#92400e" : "#166534"
      ), (!z || T[0] & /*offline*/
      1048576) && ke(
        o,
        "border-color",
        /*offline*/
        E[20] ? "#f59e0b" : "#86efac"
      ), (!z || T[0] & /*nombre*/
      2048) && te(
        v,
        /*nombre*/
        E[11]
      );
    },
    i(E) {
      z || (C(S.$$.fragment, E), z = !0);
    },
    o(E) {
      A(S.$$.fragment, E), z = !1;
    },
    d(E) {
      E && _(e), oe(S), I = !1, we(k);
    }
  };
}
function Ft(l) {
  let e;
  return {
    c() {
      e = p("p"), e.innerHTML = "⚡ <b>Modo Sin Internet (Offline Activo):</b> Trabajando con pedidos y muebles guardados localmente e <b>IA Local del Taller</b>.", a(e, "class", "aviso svelte-ykyv02"), ke(e, "background", "#fef3c7"), ke(e, "border-color", "#f59e0b"), ke(e, "color", "#78350f");
    },
    m(t, n) {
      m(t, e, n);
    },
    d(t) {
      t && _(e);
    }
  };
}
function Un(l) {
  let e, t, n, r, o, i, s = (
    /*activosN*/
    l[92] + ""
  ), c, f, h = (
    /*activosN*/
    l[92] === 1 ? "" : "s"
  ), g, v, d = (
    /*activosN*/
    l[92] === 1 ? "" : "s"
  ), y, S, D, z, I, k, E, T, P, b, w, L, W, Y, F, Z, U, H, $, V, R, j = (
    /*aviso*/
    l[13] && qt(l)
  );
  const x = [Qn, Kn, Jn], be = [];
  function Ee(G, le) {
    return (
      /*accion*/
      G[91] ? 0 : (
        /*activosN*/
        G[92] === 0 ? 1 : 2
      )
    );
  }
  n = Ee(l), r = be[n] = x[n](l);
  let fe = (
    /*pendientesN*/
    l[93] > 0 && xn(l)
  ), Q = (
    /*proximas*/
    l[94].length > 0 && er(l)
  );
  T = new se({ props: { name: "clipboard", size: 22 } });
  const Oe = [lr, tr], he = [];
  function Pe(G, le) {
    return (
      /*orders*/
      G[12].length === 0 ? 0 : 1
    );
  }
  w = Pe(l), L = he[w] = Oe[w](l), Z = new se({ props: { name: "truck", size: 22 } });
  const De = [dr, fr], $e = [];
  function Re(G, le) {
    return (
      /*proximas*/
      G[94].length === 0 ? 0 : 1
    );
  }
  return $ = Re(l), V = $e[$] = De[$](l), {
    c() {
      j && j.c(), e = M(), t = p("section"), r.c(), o = M(), i = p("p"), c = N(s), f = N(" trabajo"), g = N(h), v = N(" activo"), y = N(d), S = M(), fe && fe.c(), D = M(), Q && Q.c(), z = M(), I = p("div"), k = p("div"), E = p("h1"), ie(T.$$.fragment), P = N(" Mis trabajos"), b = M(), L.c(), W = M(), Y = p("aside"), F = p("h1"), ie(Z.$$.fragment), U = N(" Próximas entregas"), H = M(), V.c(), a(i, "class", "hero-resumen svelte-ykyv02"), a(t, "class", "hero svelte-ykyv02"), a(E, "class", "svelte-ykyv02"), a(k, "class", "col-principal svelte-ykyv02"), a(F, "class", "svelte-ykyv02"), a(Y, "class", "col-lado svelte-ykyv02"), a(I, "class", "cols svelte-ykyv02");
    },
    m(G, le) {
      j && j.m(G, le), m(G, e, le), m(G, t, le), be[n].m(t, null), u(t, o), u(t, i), u(i, c), u(i, f), u(i, g), u(i, v), u(i, y), u(i, S), fe && fe.m(i, null), u(i, D), Q && Q.m(i, null), m(G, z, le), m(G, I, le), u(I, k), u(k, E), re(T, E, null), u(E, P), u(k, b), he[w].m(k, null), u(I, W), u(I, Y), u(Y, F), re(Z, F, null), u(F, U), u(Y, H), $e[$].m(Y, null), R = !0;
    },
    p(G, le) {
      /*aviso*/
      G[13] ? j ? (j.p(G, le), le[0] & /*aviso*/
      8192 && C(j, 1)) : (j = qt(G), j.c(), C(j, 1), j.m(e.parentNode, e)) : j && (ce(), A(j, 1, 1, () => {
        j = null;
      }), ue()), r.p(G, le), /*pendientesN*/
      G[93] > 0 && fe.p(G, le), /*proximas*/
      G[94].length > 0 && Q.p(G, le);
      let Me = w;
      w = Pe(G), w === Me ? he[w].p(G, le) : (ce(), A(he[Me], 1, 1, () => {
        he[Me] = null;
      }), ue(), L = he[w], L ? L.p(G, le) : (L = he[w] = Oe[w](G), L.c()), C(L, 1), L.m(k, null)), V.p(G, le);
    },
    i(G) {
      R || (C(j), C(r), C(T.$$.fragment, G), C(L), C(Z.$$.fragment, G), C(V), R = !0);
    },
    o(G) {
      A(j), A(r), A(T.$$.fragment, G), A(L), A(Z.$$.fragment, G), A(V), R = !1;
    },
    d(G) {
      G && (_(e), _(t), _(z), _(I)), j && j.d(G), be[n].d(), fe && fe.d(), Q && Q.d(), oe(T), he[w].d(), oe(Z), $e[$].d();
    }
  };
}
function Vn(l) {
  let e, t, n, r, o, i, s;
  return {
    c() {
      e = p("section"), t = p("p"), n = N(
        /*error*/
        l[9]
      ), r = M(), o = p("button"), o.textContent = "Reintentar", a(t, "class", "big svelte-ykyv02"), a(o, "class", "btn grande svelte-ykyv02"), a(e, "class", "card svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), u(e, t), u(t, n), u(e, r), u(e, o), i || (s = X(
        o,
        "click",
        /*click_handler_5*/
        l[48]
      ), i = !0);
    },
    p(c, f) {
      f[0] & /*error*/
      512 && te(
        n,
        /*error*/
        c[9]
      );
    },
    i: K,
    o: K,
    d(c) {
      c && _(e), i = !1, s();
    }
  };
}
function Wn(l) {
  let e;
  return {
    c() {
      e = p("p"), e.textContent = "Cargando tus trabajos…", a(e, "class", "big center gris-texto svelte-ykyv02");
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && _(e);
    }
  };
}
function Yn(l) {
  let e, t, n, r, o, i = (
    /*productos*/
    l[1].length + ""
  ), s, c, f, h, g, v, d, y, S, D = (
    /*aviso*/
    l[13] && Zt(l)
  );
  r = new se({ props: { name: "store", size: 22 } });
  function z(E, T) {
    return (
      /*productos*/
      E[1].length === 0 ? kr : vr
    );
  }
  let I = z(l), k = I(l);
  return {
    c() {
      D && D.c(), e = M(), t = p("div"), n = p("h1"), ie(r.$$.fragment), o = N(" Muebles en venta ("), s = N(i), c = N(")"), f = M(), h = p("button"), h.textContent = "+ Publicar mueble", g = M(), k.c(), v = Ae(), a(n, "class", "svelte-ykyv02"), a(h, "class", "btn verde svelte-ykyv02"), a(t, "class", "mk-head svelte-ykyv02");
    },
    m(E, T) {
      D && D.m(E, T), m(E, e, T), m(E, t, T), u(t, n), re(r, n, null), u(n, o), u(n, s), u(n, c), u(t, f), u(t, h), m(E, g, T), k.m(E, T), m(E, v, T), d = !0, y || (S = X(
        h,
        "click",
        /*abrirNuevo*/
        l[24]
      ), y = !0);
    },
    p(E, T) {
      /*aviso*/
      E[13] ? D ? (D.p(E, T), T[0] & /*aviso*/
      8192 && C(D, 1)) : (D = Zt(E), D.c(), C(D, 1), D.m(e.parentNode, e)) : D && (ce(), A(D, 1, 1, () => {
        D = null;
      }), ue()), (!d || T[0] & /*productos*/
      2) && i !== (i = /*productos*/
      E[1].length + "") && te(s, i), I === (I = z(E)) && k ? k.p(E, T) : (k.d(1), k = I(E), k && (k.c(), k.m(v.parentNode, v)));
    },
    i(E) {
      d || (C(D), C(r.$$.fragment, E), d = !0);
    },
    o(E) {
      A(D), A(r.$$.fragment, E), d = !1;
    },
    d(E) {
      E && (_(e), _(t), _(g), _(v)), D && D.d(E), oe(r), k.d(E), y = !1, S();
    }
  };
}
function qt(l) {
  let e, t, n, r, o;
  return t = new se({
    props: { name: "check-circle", size: 20 }
  }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = M(), r = N(
        /*aviso*/
        l[13]
      ), a(e, "class", "aviso svelte-ykyv02");
    },
    m(i, s) {
      m(i, e, s), re(t, e, null), u(e, n), u(e, r), o = !0;
    },
    p(i, s) {
      (!o || s[0] & /*aviso*/
      8192) && te(
        r,
        /*aviso*/
        i[13]
      );
    },
    i(i) {
      o || (C(t.$$.fragment, i), o = !0);
    },
    o(i) {
      A(t.$$.fragment, i), o = !1;
    },
    d(i) {
      i && _(e), oe(t);
    }
  };
}
function Jn(l) {
  let e, t, n, r, o, i, s, c;
  return t = new se({
    props: { name: "check-circle", size: 16 }
  }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = N(" Todo terminado"), r = M(), o = p("p"), o.textContent = "Completaste todos los pasos", i = M(), s = p("p"), s.textContent = "Espera a que el encargado revise el trabajo.", a(e, "class", "hero-label svelte-ykyv02"), a(o, "class", "hero-paso svelte-ykyv02"), a(s, "class", "hero-trabajo svelte-ykyv02");
    },
    m(f, h) {
      m(f, e, h), re(t, e, null), u(e, n), m(f, r, h), m(f, o, h), m(f, i, h), m(f, s, h), c = !0;
    },
    p: K,
    i(f) {
      c || (C(t.$$.fragment, f), c = !0);
    },
    o(f) {
      A(t.$$.fragment, f), c = !1;
    },
    d(f) {
      f && (_(e), _(r), _(o), _(i), _(s)), oe(t);
    }
  };
}
function Kn(l) {
  let e, t, n, r, o, i, s, c;
  return t = new se({
    props: { name: "check-circle", size: 16 }
  }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = N(" Todo en orden"), r = M(), o = p("p"), o.textContent = "No tienes trabajos pendientes", i = M(), s = p("p"), s.textContent = "Cuando te asignen uno, aparecerá aquí.", a(e, "class", "hero-label svelte-ykyv02"), a(o, "class", "hero-paso svelte-ykyv02"), a(s, "class", "hero-trabajo svelte-ykyv02");
    },
    m(f, h) {
      m(f, e, h), re(t, e, null), u(e, n), m(f, r, h), m(f, o, h), m(f, i, h), m(f, s, h), c = !0;
    },
    p: K,
    i(f) {
      c || (C(t.$$.fragment, f), c = !0);
    },
    o(f) {
      A(t.$$.fragment, f), c = !1;
    },
    d(f) {
      f && (_(e), _(r), _(o), _(i), _(s)), oe(t);
    }
  };
}
function Qn(l) {
  let e, t, n, r, o, i, s, c, f, h, g, v, d, y;
  t = new se({ props: { name: "flag", size: 16 } });
  const S = [Xn, Zn], D = [];
  function z(k, E) {
    return (
      /*accion*/
      k[91].paso.status === "PENDING" ? 0 : 1
    );
  }
  h = z(l), g = D[h] = S[h](l);
  function I() {
    return (
      /*click_handler_6*/
      l[49](
        /*accion*/
        l[91]
      )
    );
  }
  return {
    c() {
      var k;
      e = p("p"), ie(t.$$.fragment), n = N(" Lo siguiente que tienes que hacer"), r = M(), o = p("p"), o.textContent = `${/*accion*/
      l[91].paso.name}`, i = M(), s = p("p"), s.textContent = `del trabajo «${/*accion*/
      l[91].order.description || "sin nombre"}» para ${/*accion*/
      (k = l[91].order.client) == null ? void 0 : k.name}`, c = M(), f = p("button"), g.c(), a(e, "class", "hero-label svelte-ykyv02"), a(o, "class", "hero-paso svelte-ykyv02"), a(s, "class", "hero-trabajo svelte-ykyv02"), a(f, "class", "btn hero-btn svelte-ykyv02"), ne(
        f,
        "naranja",
        /*accion*/
        l[91].paso.status === "PENDING"
      ), ne(
        f,
        "verde",
        /*accion*/
        l[91].paso.status === "IN_PROGRESS"
      );
    },
    m(k, E) {
      m(k, e, E), re(t, e, null), u(e, n), m(k, r, E), m(k, o, E), m(k, i, E), m(k, s, E), m(k, c, E), m(k, f, E), D[h].m(f, null), v = !0, d || (y = X(f, "click", I), d = !0);
    },
    p(k, E) {
      l = k;
    },
    i(k) {
      v || (C(t.$$.fragment, k), C(g), v = !0);
    },
    o(k) {
      A(t.$$.fragment, k), A(g), v = !1;
    },
    d(k) {
      k && (_(e), _(r), _(o), _(i), _(s), _(c), _(f)), oe(t), D[h].d(), d = !1, y();
    }
  };
}
function Zn(l) {
  let e, t, n;
  return e = new se({ props: { name: "check", size: 20 } }), {
    c() {
      ie(e.$$.fragment), t = N(" Ya lo terminé");
    },
    m(r, o) {
      re(e, r, o), m(r, t, o), n = !0;
    },
    i(r) {
      n || (C(e.$$.fragment, r), n = !0);
    },
    o(r) {
      A(e.$$.fragment, r), n = !1;
    },
    d(r) {
      r && _(t), oe(e, r);
    }
  };
}
function Xn(l) {
  let e, t, n;
  return e = new se({ props: { name: "play", size: 20 } }), {
    c() {
      ie(e.$$.fragment), t = N(" Empezar ahora");
    },
    m(r, o) {
      re(e, r, o), m(r, t, o), n = !0;
    },
    i(r) {
      n || (C(e.$$.fragment, r), n = !0);
    },
    o(r) {
      A(e.$$.fragment, r), n = !1;
    },
    d(r) {
      r && _(t), oe(e, r);
    }
  };
}
function xn(l) {
  let e, t = (
    /*pendientesN*/
    l[93] + ""
  ), n, r, o = (
    /*pendientesN*/
    l[93] === 1 ? "" : "s"
  ), i, s;
  return {
    c() {
      e = N("· "), n = N(t), r = N(" paso"), i = N(o), s = N(" por hacer");
    },
    m(c, f) {
      m(c, e, f), m(c, n, f), m(c, r, f), m(c, i, f), m(c, s, f);
    },
    p: K,
    d(c) {
      c && (_(e), _(n), _(r), _(i), _(s));
    }
  };
}
function er(l) {
  let e, t = ft(
    /*proximas*/
    l[94][0].delivery.scheduledDate
  ) + "", n;
  return {
    c() {
      e = N("· próxima entrega "), n = N(t);
    },
    m(r, o) {
      m(r, e, o), m(r, n, o);
    },
    p: K,
    d(r) {
      r && (_(e), _(n));
    }
  };
}
function tr(l) {
  let e = [], t = /* @__PURE__ */ new Map(), n, r, o = de(
    /*orders*/
    l[12]
  );
  const i = (s) => (
    /*o*/
    s[95].id
  );
  for (let s = 0; s < o.length; s += 1) {
    let c = Pt(l, o, s), f = i(c);
    t.set(f, e[s] = Kt(f, c));
  }
  return {
    c() {
      for (let s = 0; s < e.length; s += 1)
        e[s].c();
      n = Ae();
    },
    m(s, c) {
      for (let f = 0; f < e.length; f += 1)
        e[f] && e[f].m(s, c);
      m(s, n, c), r = !0;
    },
    p(s, c) {
      c[0] & /*orders, WOOD, FURNITURE*/
      805310464 | c[1] & /*pedirConfirmacionPaso*/
      256 && (o = de(
        /*orders*/
        s[12]
      ), ce(), e = dt(e, c, i, 1, s, o, t, n.parentNode, gt, Kt, n, Pt), ue());
    },
    i(s) {
      if (!r) {
        for (let c = 0; c < o.length; c += 1)
          C(e[c]);
        r = !0;
      }
    },
    o(s) {
      for (let c = 0; c < e.length; c += 1)
        A(e[c]);
      r = !1;
    },
    d(s) {
      s && _(n);
      for (let c = 0; c < e.length; c += 1)
        e[c].d(s);
    }
  };
}
function lr(l) {
  let e;
  return {
    c() {
      e = p("section"), e.innerHTML = '<p class="big center gris-texto svelte-ykyv02">No tienes trabajos asignados ahora mismo.</p>', a(e, "class", "card svelte-ykyv02");
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && _(e);
    }
  };
}
function Bt(l) {
  let e, t, n, r, o = (
    /*urg*/
    l[102].texto + ""
  ), i, s, c;
  const f = [rr, nr], h = [];
  function g(v, d) {
    return (
      /*urg*/
      v[102].nivel === "rojo" ? 0 : 1
    );
  }
  return t = g(l), n = h[t] = f[t](l), {
    c() {
      e = p("span"), n.c(), r = M(), i = N(o), a(e, "class", s = "urgencia " + /*urg*/
      l[102].nivel + " svelte-ykyv02");
    },
    m(v, d) {
      m(v, e, d), h[t].m(e, null), u(e, r), u(e, i), c = !0;
    },
    p(v, d) {
      let y = t;
      t = g(v), t !== y && (ce(), A(h[y], 1, 1, () => {
        h[y] = null;
      }), ue(), n = h[t], n || (n = h[t] = f[t](v), n.c()), C(n, 1), n.m(e, r)), (!c || d[0] & /*orders*/
      4096) && o !== (o = /*urg*/
      v[102].texto + "") && te(i, o), (!c || d[0] & /*orders*/
      4096 && s !== (s = "urgencia " + /*urg*/
      v[102].nivel + " svelte-ykyv02")) && a(e, "class", s);
    },
    i(v) {
      c || (C(n), c = !0);
    },
    o(v) {
      A(n), c = !1;
    },
    d(v) {
      v && _(e), h[t].d();
    }
  };
}
function nr(l) {
  let e, t;
  return e = new se({ props: { name: "clock", size: 14 } }), {
    c() {
      ie(e.$$.fragment);
    },
    m(n, r) {
      re(e, n, r), t = !0;
    },
    i(n) {
      t || (C(e.$$.fragment, n), t = !0);
    },
    o(n) {
      A(e.$$.fragment, n), t = !1;
    },
    d(n) {
      oe(e, n);
    }
  };
}
function rr(l) {
  let e, t;
  return e = new se({ props: { name: "alert", size: 14 } }), {
    c() {
      ie(e.$$.fragment);
    },
    m(n, r) {
      re(e, n, r), t = !0;
    },
    i(n) {
      t || (C(e.$$.fragment, n), t = !0);
    },
    o(n) {
      A(e.$$.fragment, n), t = !1;
    },
    d(n) {
      oe(e, n);
    }
  };
}
function Ht(l) {
  let e, t = de(
    /*o*/
    l[95].items
  ), n = [];
  for (let r = 0; r < t.length; r += 1)
    n[r] = Ut(zt(l, t, r));
  return {
    c() {
      e = p("ul");
      for (let r = 0; r < n.length; r += 1)
        n[r].c();
      a(e, "class", "hacer svelte-ykyv02");
    },
    m(r, o) {
      m(r, e, o);
      for (let i = 0; i < n.length; i += 1)
        n[i] && n[i].m(e, null);
    },
    p(r, o) {
      if (o[0] & /*WOOD, orders, FURNITURE*/
      805310464) {
        t = de(
          /*o*/
          r[95].items
        );
        let i;
        for (i = 0; i < t.length; i += 1) {
          const s = zt(r, t, i);
          n[i] ? n[i].p(s, o) : (n[i] = Ut(s), n[i].c(), n[i].m(e, null));
        }
        for (; i < n.length; i += 1)
          n[i].d(1);
        n.length = t.length;
      }
    },
    d(r) {
      r && _(e), tt(n, r);
    }
  };
}
function Gt(l) {
  let e, t, n = (
    /*WOOD*/
    (l[28][
      /*it*/
      l[107].woodType
    ] ?? /*it*/
    l[107].woodType) + ""
  ), r;
  return {
    c() {
      e = p("span"), t = N("· madera "), r = N(n), a(e, "class", "madera svelte-ykyv02");
    },
    m(o, i) {
      m(o, e, i), u(e, t), u(e, r);
    },
    p(o, i) {
      i[0] & /*orders*/
      4096 && n !== (n = /*WOOD*/
      (o[28][
        /*it*/
        o[107].woodType
      ] ?? /*it*/
      o[107].woodType) + "") && te(r, n);
    },
    d(o) {
      o && _(e);
    }
  };
}
function Ut(l) {
  let e, t, n = (
    /*it*/
    l[107].quantity + ""
  ), r, o, i, s = (
    /*it*/
    (l[107].description || /*FURNITURE*/
    l[29][
      /*it*/
      l[107].furnitureType
    ] || "pieza") + ""
  ), c, f, h, g = (
    /*it*/
    l[107].woodType && Gt(l)
  );
  return {
    c() {
      e = p("li"), t = p("b"), r = N(n), o = N("×"), i = M(), c = N(s), f = M(), g && g.c(), h = M(), a(e, "class", "svelte-ykyv02");
    },
    m(v, d) {
      m(v, e, d), u(e, t), u(t, r), u(t, o), u(e, i), u(e, c), u(e, f), g && g.m(e, null), u(e, h);
    },
    p(v, d) {
      d[0] & /*orders*/
      4096 && n !== (n = /*it*/
      v[107].quantity + "") && te(r, n), d[0] & /*orders*/
      4096 && s !== (s = /*it*/
      (v[107].description || /*FURNITURE*/
      v[29][
        /*it*/
        v[107].furnitureType
      ] || "pieza") + "") && te(c, s), /*it*/
      v[107].woodType ? g ? g.p(v, d) : (g = Gt(v), g.c(), g.m(e, h)) : g && (g.d(1), g = null);
    },
    d(v) {
      v && _(e), g && g.d();
    }
  };
}
function Vt(l) {
  let e, t, n, r, o = ft(Fe(
    /*o*/
    l[95]
  )) + "", i, s;
  return t = new se({ props: { name: "calendar", size: 15 } }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = N(" Entregar el "), r = p("b"), i = N(o), a(e, "class", "fecha svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), re(t, e, null), u(e, n), u(e, r), u(r, i), s = !0;
    },
    p(c, f) {
      (!s || f[0] & /*orders*/
      4096) && o !== (o = ft(Fe(
        /*o*/
        c[95]
      )) + "") && te(i, o);
    },
    i(c) {
      s || (C(t.$$.fragment, c), s = !0);
    },
    o(c) {
      A(t.$$.fragment, c), s = !1;
    },
    d(c) {
      c && _(e), oe(t);
    }
  };
}
function or(l) {
  let e;
  return {
    c() {
      e = p("p"), e.textContent = "Este trabajo aún no tiene pasos definidos.", a(e, "class", "hint svelte-ykyv02");
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && _(e);
    }
  };
}
function ir(l) {
  let e, t, n, r, o, i = bt(
    /*o*/
    l[95]
  ) + "", s, c, f = (
    /*pasos*/
    l[100].length + ""
  ), h, g, v, d, y = [], S = /* @__PURE__ */ new Map(), D, z, I, k = de(
    /*pasos*/
    l[100]
  );
  const E = (P) => (
    /*p*/
    P[88].id
  );
  for (let P = 0; P < k.length; P += 1) {
    let b = Rt(l, k, P), w = E(b);
    S.set(w, y[P] = Yt(w, b));
  }
  let T = !/*sig*/
  l[101] && Jt();
  return {
    c() {
      e = p("div"), t = p("div"), n = p("div"), r = M(), o = p("p"), s = N(i), c = N(" de "), h = N(f), g = N(" pasos listos"), v = M(), d = p("ol");
      for (let P = 0; P < y.length; P += 1)
        y[P].c();
      D = M(), T && T.c(), z = Ae(), a(n, "class", "relleno svelte-ykyv02"), ke(n, "width", ul(
        /*o*/
        l[95]
      ) + "%"), a(t, "class", "barra svelte-ykyv02"), a(o, "class", "svelte-ykyv02"), a(e, "class", "progreso svelte-ykyv02"), a(d, "class", "pasos svelte-ykyv02");
    },
    m(P, b) {
      m(P, e, b), u(e, t), u(t, n), u(e, r), u(e, o), u(o, s), u(o, c), u(o, h), u(o, g), m(P, v, b), m(P, d, b);
      for (let w = 0; w < y.length; w += 1)
        y[w] && y[w].m(d, null);
      m(P, D, b), T && T.m(P, b), m(P, z, b), I = !0;
    },
    p(P, b) {
      (!I || b[0] & /*orders*/
      4096) && ke(n, "width", ul(
        /*o*/
        P[95]
      ) + "%"), (!I || b[0] & /*orders*/
      4096) && i !== (i = bt(
        /*o*/
        P[95]
      ) + "") && te(s, i), (!I || b[0] & /*orders*/
      4096) && f !== (f = /*pasos*/
      P[100].length + "") && te(h, f), b[0] & /*orders*/
      4096 | b[1] & /*pedirConfirmacionPaso*/
      256 && (k = de(
        /*pasos*/
        P[100]
      ), ce(), y = dt(y, b, E, 1, P, k, S, d, gt, Yt, null, Rt), ue()), /*sig*/
      P[101] ? T && (ce(), A(T, 1, 1, () => {
        T = null;
      }), ue()) : T ? b[0] & /*orders*/
      4096 && C(T, 1) : (T = Jt(), T.c(), C(T, 1), T.m(z.parentNode, z));
    },
    i(P) {
      if (!I) {
        for (let b = 0; b < k.length; b += 1)
          C(y[b]);
        C(T), I = !0;
      }
    },
    o(P) {
      for (let b = 0; b < y.length; b += 1)
        A(y[b]);
      A(T), I = !1;
    },
    d(P) {
      P && (_(e), _(v), _(d), _(D), _(z));
      for (let b = 0; b < y.length; b += 1)
        y[b].d();
      T && T.d(P);
    }
  };
}
function sr(l) {
  let e = (
    /*i*/
    l[106] + 1 + ""
  ), t;
  return {
    c() {
      t = N(e);
    },
    m(n, r) {
      m(n, t, r);
    },
    p(n, r) {
      r[0] & /*orders*/
      4096 && e !== (e = /*i*/
      n[106] + 1 + "") && te(t, e);
    },
    i: K,
    o: K,
    d(n) {
      n && _(t);
    }
  };
}
function ar(l) {
  let e, t;
  return e = new se({ props: { name: "check", size: 14 } }), {
    c() {
      ie(e.$$.fragment);
    },
    m(n, r) {
      re(e, n, r), t = !0;
    },
    p: K,
    i(n) {
      t || (C(e.$$.fragment, n), t = !0);
    },
    o(n) {
      A(e.$$.fragment, n), t = !1;
    },
    d(n) {
      oe(e, n);
    }
  };
}
function Wt(l) {
  let e, t, n, r;
  const o = [ur, cr], i = [];
  function s(c, f) {
    return (
      /*p*/
      c[88].status === "PENDING" ? 0 : 1
    );
  }
  return e = s(l), t = i[e] = o[e](l), {
    c() {
      t.c(), n = Ae();
    },
    m(c, f) {
      i[e].m(c, f), m(c, n, f), r = !0;
    },
    p(c, f) {
      let h = e;
      e = s(c), e === h ? i[e].p(c, f) : (ce(), A(i[h], 1, 1, () => {
        i[h] = null;
      }), ue(), t = i[e], t ? t.p(c, f) : (t = i[e] = o[e](c), t.c()), C(t, 1), t.m(n.parentNode, n));
    },
    i(c) {
      r || (C(t), r = !0);
    },
    o(c) {
      A(t), r = !1;
    },
    d(c) {
      c && _(n), i[e].d(c);
    }
  };
}
function cr(l) {
  let e, t, n, r, o, i;
  t = new se({ props: { name: "check", size: 16 } });
  function s() {
    return (
      /*click_handler_8*/
      l[51](
        /*p*/
        l[88]
      )
    );
  }
  return {
    c() {
      e = p("button"), ie(t.$$.fragment), n = N(" Ya terminé"), a(e, "class", "btn verde svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), re(t, e, null), u(e, n), r = !0, o || (i = X(e, "click", s), o = !0);
    },
    p(c, f) {
      l = c;
    },
    i(c) {
      r || (C(t.$$.fragment, c), r = !0);
    },
    o(c) {
      A(t.$$.fragment, c), r = !1;
    },
    d(c) {
      c && _(e), oe(t), o = !1, i();
    }
  };
}
function ur(l) {
  let e, t, n, r, o, i;
  t = new se({ props: { name: "play", size: 16 } });
  function s() {
    return (
      /*click_handler_7*/
      l[50](
        /*p*/
        l[88]
      )
    );
  }
  return {
    c() {
      e = p("button"), ie(t.$$.fragment), n = N(" Empezar"), a(e, "class", "btn naranja svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), re(t, e, null), u(e, n), r = !0, o || (i = X(e, "click", s), o = !0);
    },
    p(c, f) {
      l = c;
    },
    i(c) {
      r || (C(t.$$.fragment, c), r = !0);
    },
    o(c) {
      A(t.$$.fragment, c), r = !1;
    },
    d(c) {
      c && _(e), oe(t), o = !1, i();
    }
  };
}
function Yt(l, e) {
  var z;
  let t, n, r, o, i, s, c = (
    /*p*/
    e[88].name + ""
  ), f, h, g, v;
  const d = [ar, sr], y = [];
  function S(I, k) {
    return (
      /*p*/
      I[88].status === "COMPLETED" ? 0 : 1
    );
  }
  r = S(e), o = y[r] = d[r](e);
  let D = (
    /*p*/
    e[88].id === /*sig*/
    ((z = e[101]) == null ? void 0 : z.id) && Wt(e)
  );
  return {
    key: l,
    first: null,
    c() {
      t = p("li"), n = p("span"), o.c(), i = M(), s = p("span"), f = N(c), h = M(), D && D.c(), g = M(), a(n, "class", "num svelte-ykyv02"), ne(
        n,
        "num-ok",
        /*p*/
        e[88].status === "COMPLETED"
      ), ne(
        n,
        "num-curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      ), a(s, "class", "pname svelte-ykyv02"), a(t, "class", "svelte-ykyv02"), ne(
        t,
        "hecho",
        /*p*/
        e[88].status === "COMPLETED"
      ), ne(
        t,
        "curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      ), this.first = t;
    },
    m(I, k) {
      m(I, t, k), u(t, n), y[r].m(n, null), u(t, i), u(t, s), u(s, f), u(t, h), D && D.m(t, null), u(t, g), v = !0;
    },
    p(I, k) {
      var T;
      e = I;
      let E = r;
      r = S(e), r === E ? y[r].p(e, k) : (ce(), A(y[E], 1, 1, () => {
        y[E] = null;
      }), ue(), o = y[r], o ? o.p(e, k) : (o = y[r] = d[r](e), o.c()), C(o, 1), o.m(n, null)), (!v || k[0] & /*orders*/
      4096) && ne(
        n,
        "num-ok",
        /*p*/
        e[88].status === "COMPLETED"
      ), (!v || k[0] & /*orders*/
      4096) && ne(
        n,
        "num-curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      ), (!v || k[0] & /*orders*/
      4096) && c !== (c = /*p*/
      e[88].name + "") && te(f, c), /*p*/
      e[88].id === /*sig*/
      ((T = e[101]) == null ? void 0 : T.id) ? D ? (D.p(e, k), k[0] & /*orders*/
      4096 && C(D, 1)) : (D = Wt(e), D.c(), C(D, 1), D.m(t, g)) : D && (ce(), A(D, 1, 1, () => {
        D = null;
      }), ue()), (!v || k[0] & /*orders*/
      4096) && ne(
        t,
        "hecho",
        /*p*/
        e[88].status === "COMPLETED"
      ), (!v || k[0] & /*orders*/
      4096) && ne(
        t,
        "curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      );
    },
    i(I) {
      v || (C(o), C(D), v = !0);
    },
    o(I) {
      A(o), A(D), v = !1;
    },
    d(I) {
      I && _(t), y[r].d(), D && D.d();
    }
  };
}
function Jt(l) {
  let e, t, n, r;
  return t = new se({
    props: { name: "check-circle", size: 18 }
  }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = N(" ¡Trabajo terminado! Avisa al encargado."), a(e, "class", "terminado svelte-ykyv02");
    },
    m(o, i) {
      m(o, e, i), re(t, e, null), u(e, n), r = !0;
    },
    i(o) {
      r || (C(t.$$.fragment, o), r = !0);
    },
    o(o) {
      A(t.$$.fragment, o), r = !1;
    },
    d(o) {
      o && _(e), oe(t);
    }
  };
}
function Kt(l, e) {
  var Z, U;
  let t, n, r, o = (
    /*o*/
    (e[95].description || "Trabajo sin nombre") + ""
  ), i, s, c, f, h, g, v, d = (
    /*o*/
    (((Z = e[95].client) == null ? void 0 : Z.name) ?? "—") + ""
  ), y, S, D, z = Fe(
    /*o*/
    e[95]
  ), I, k, E, T, P, b = (
    /*urg*/
    e[102] && Bt(e)
  );
  h = new se({ props: { name: "user", size: 14 } });
  let w = (
    /*o*/
    ((U = e[95].items) == null ? void 0 : U.length) && Ht(e)
  ), L = z && Vt(e);
  const W = [ir, or], Y = [];
  function F(H, $) {
    return (
      /*pasos*/
      H[100].length ? 0 : 1
    );
  }
  return k = F(e), E = Y[k] = W[k](e), {
    key: l,
    first: null,
    c() {
      t = p("section"), n = p("div"), r = p("h2"), i = N(o), s = M(), b && b.c(), c = M(), f = p("p"), ie(h.$$.fragment), g = N(" Para: "), v = p("b"), y = N(d), S = M(), w && w.c(), D = M(), L && L.c(), I = M(), E.c(), T = M(), a(r, "class", "svelte-ykyv02"), a(n, "class", "trabajo-top svelte-ykyv02"), a(f, "class", "para svelte-ykyv02"), a(t, "class", "card trabajo svelte-ykyv02"), ne(t, "terminado-card", fl(
        /*o*/
        e[95]
      )), this.first = t;
    },
    m(H, $) {
      m(H, t, $), u(t, n), u(n, r), u(r, i), u(n, s), b && b.m(n, null), u(t, c), u(t, f), re(h, f, null), u(f, g), u(f, v), u(v, y), u(t, S), w && w.m(t, null), u(t, D), L && L.m(t, null), u(t, I), Y[k].m(t, null), u(t, T), P = !0;
    },
    p(H, $) {
      var R, j;
      e = H, (!P || $[0] & /*orders*/
      4096) && o !== (o = /*o*/
      (e[95].description || "Trabajo sin nombre") + "") && te(i, o), /*urg*/
      e[102] ? b ? (b.p(e, $), $[0] & /*orders*/
      4096 && C(b, 1)) : (b = Bt(e), b.c(), C(b, 1), b.m(n, null)) : b && (ce(), A(b, 1, 1, () => {
        b = null;
      }), ue()), (!P || $[0] & /*orders*/
      4096) && d !== (d = /*o*/
      (((R = e[95].client) == null ? void 0 : R.name) ?? "—") + "") && te(y, d), /*o*/
      (j = e[95].items) != null && j.length ? w ? w.p(e, $) : (w = Ht(e), w.c(), w.m(t, D)) : w && (w.d(1), w = null), $[0] & /*orders*/
      4096 && (z = Fe(
        /*o*/
        e[95]
      )), z ? L ? (L.p(e, $), $[0] & /*orders*/
      4096 && C(L, 1)) : (L = Vt(e), L.c(), C(L, 1), L.m(t, I)) : L && (ce(), A(L, 1, 1, () => {
        L = null;
      }), ue());
      let V = k;
      k = F(e), k === V ? Y[k].p(e, $) : (ce(), A(Y[V], 1, 1, () => {
        Y[V] = null;
      }), ue(), E = Y[k], E ? E.p(e, $) : (E = Y[k] = W[k](e), E.c()), C(E, 1), E.m(t, T)), (!P || $[0] & /*orders*/
      4096) && ne(t, "terminado-card", fl(
        /*o*/
        e[95]
      ));
    },
    i(H) {
      P || (C(b), C(h.$$.fragment, H), C(L), C(E), P = !0);
    },
    o(H) {
      A(b), A(h.$$.fragment, H), A(L), A(E), P = !1;
    },
    d(H) {
      H && _(t), b && b.d(), oe(h), w && w.d(), L && L.d(), Y[k].d();
    }
  };
}
function fr(l) {
  let e = [], t = /* @__PURE__ */ new Map(), n, r, o = de(
    /*proximas*/
    l[94]
  );
  const i = (s) => (
    /*o*/
    s[95].id
  );
  for (let s = 0; s < o.length; s += 1) {
    let c = Ot(l, o, s), f = i(c);
    t.set(f, e[s] = Qt(f, c));
  }
  return {
    c() {
      for (let s = 0; s < e.length; s += 1)
        e[s].c();
      n = Ae();
    },
    m(s, c) {
      for (let f = 0; f < e.length; f += 1)
        e[f] && e[f].m(s, c);
      m(s, n, c), r = !0;
    },
    p(s, c) {
      c[0] & /*SLOT*/
      1073741824 | c[1] & /*DELIVERY_STATUS, entregasProximas*/
      33 && (o = de(
        /*proximas*/
        s[94]
      ), ce(), e = dt(e, c, i, 1, s, o, t, n.parentNode, gt, Qt, n, Ot), ue());
    },
    i(s) {
      if (!r) {
        for (let c = 0; c < o.length; c += 1)
          C(e[c]);
        r = !0;
      }
    },
    o(s) {
      for (let c = 0; c < e.length; c += 1)
        A(e[c]);
      r = !1;
    },
    d(s) {
      s && _(n);
      for (let c = 0; c < e.length; c += 1)
        e[c].d(s);
    }
  };
}
function dr(l) {
  let e;
  return {
    c() {
      e = p("section"), e.innerHTML = '<p class="big center gris-texto svelte-ykyv02">No tienes entregas programadas.</p>', a(e, "class", "card svelte-ykyv02");
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    i: K,
    o: K,
    d(t) {
      t && _(e);
    }
  };
}
function pr(l) {
  let e;
  return {
    c() {
      e = p("span"), e.textContent = `${/*o*/
      l[95].d < 0 ? "Pasada" : (
        /*o*/
        l[95].d === 0 ? "Hoy" : (
          /*o*/
          l[95].d === 1 ? "Mañana" : `En ${/*o*/
          l[95].d} días`
        )
      )}`, a(e, "class", "urgencia svelte-ykyv02"), ne(
        e,
        "rojo",
        /*o*/
        l[95].d <= 1
      ), ne(
        e,
        "ambar",
        /*o*/
        l[95].d > 1 && /*o*/
        l[95].d <= 3
      ), ne(
        e,
        "ok",
        /*o*/
        l[95].d > 3
      );
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    d(t) {
      t && _(e);
    }
  };
}
function _r(l) {
  let e, t, n, r = (
    /*o*/
    (l[95].delivery.address ?? /*o*/
    l[95].deliveryAddress) && hr(l)
  ), o = (
    /*lat*/
    l[98] && /*lng*/
    l[99] && yr(l)
  );
  return {
    c() {
      r && r.c(), e = M(), o && o.c(), t = Ae();
    },
    m(i, s) {
      r && r.m(i, s), m(i, e, s), o && o.m(i, s), m(i, t, s), n = !0;
    },
    p(i, s) {
      /*o*/
      (i[95].delivery.address ?? /*o*/
      i[95].deliveryAddress) && r.p(i, s), /*lat*/
      i[98] && /*lng*/
      i[99] && o.p(i, s);
    },
    i(i) {
      n || (C(r), C(o), n = !0);
    },
    o(i) {
      A(r), A(o), n = !1;
    },
    d(i) {
      i && (_(e), _(t)), r && r.d(i), o && o.d(i);
    }
  };
}
function mr(l) {
  let e, t, n, r, o, i;
  return t = new se({ props: { name: "store", size: 14 } }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = M(), r = p("b"), r.textContent = "El cliente recoge en el taller", o = N(" — no hay que llevar nada."), a(e, "class", "dir svelte-ykyv02");
    },
    m(s, c) {
      m(s, e, c), re(t, e, null), u(e, n), u(e, r), u(e, o), i = !0;
    },
    p: K,
    i(s) {
      i || (C(t.$$.fragment, s), i = !0);
    },
    o(s) {
      A(t.$$.fragment, s), i = !1;
    },
    d(s) {
      s && _(e), oe(t);
    }
  };
}
function hr(l) {
  let e, t, n, r = (
    /*o*/
    (l[95].delivery.address ?? /*o*/
    l[95].deliveryAddress) + ""
  ), o, i;
  return t = new se({ props: { name: "pin", size: 14 } }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = M(), o = N(r), a(e, "class", "dir svelte-ykyv02");
    },
    m(s, c) {
      m(s, e, c), re(t, e, null), u(e, n), u(e, o), i = !0;
    },
    p: K,
    i(s) {
      i || (C(t.$$.fragment, s), i = !0);
    },
    o(s) {
      A(t.$$.fragment, s), i = !1;
    },
    d(s) {
      s && _(e), oe(t);
    }
  };
}
function yr(l) {
  let e, t, n, r;
  return t = new se({ props: { name: "navigation", size: 16 } }), {
    c() {
      e = p("a"), ie(t.$$.fragment), n = N(" Abrir ubicación en Maps"), a(e, "class", "maps-btn svelte-ykyv02"), a(e, "target", "_blank"), a(e, "rel", "noopener"), a(e, "href", "https://www.google.com/maps?q=" + /*lat*/
      l[98] + "," + /*lng*/
      l[99]);
    },
    m(o, i) {
      m(o, e, i), re(t, e, null), u(e, n), r = !0;
    },
    p: K,
    i(o) {
      r || (C(t.$$.fragment, o), r = !0);
    },
    o(o) {
      A(t.$$.fragment, o), r = !1;
    },
    d(o) {
      o && _(e), oe(t);
    }
  };
}
function Qt(l, e) {
  var H;
  let t, n, r, o, i, s, c, f = (
    /*SLOT*/
    (e[30][
      /*o*/
      e[95].delivery.timeSlot
    ] ?? "") + ""
  ), h, g, v, d, y, S, D, z = (
    /*o*/
    (((H = e[95].client) == null ? void 0 : H.name) ?? "el cliente") + ""
  ), I, k, E, T, P, b, w, L;
  o = new se({ props: { name: "calendar", size: 17 } });
  let W = (
    /*o*/
    e[95].d !== null && pr(e)
  );
  const Y = [mr, _r], F = [];
  function Z($, V) {
    return (
      /*o*/
      ($[95].delivery.deliveryType ?? /*o*/
      $[95].deliveryType) === "PICKUP" ? 0 : 1
    );
  }
  function U($, V) {
    return V === 1 ? Fn($) : $;
  }
  return E = Z(e), T = F[E] = Y[E](U(e, E)), {
    key: l,
    first: null,
    c() {
      t = p("section"), n = p("div"), r = p("p"), ie(o.$$.fragment), i = M(), s = p("b"), s.textContent = `${ft(
        /*o*/
        e[95].delivery.scheduledDate
      )}`, c = N(" — "), h = N(f), g = M(), W && W.c(), v = M(), d = p("p"), y = N("Llevar: "), S = p("b"), S.textContent = `${/*o*/
      e[95].description || "pedido"}`, D = N(" de "), I = N(z), k = M(), T.c(), P = M(), b = p("span"), b.textContent = `${/*DELIVERY_STATUS*/
      e[31][
        /*o*/
        e[95].delivery.status
      ] ?? /*o*/
      e[95].delivery.status}`, w = M(), a(r, "class", "edia svelte-ykyv02"), a(n, "class", "entrega-top svelte-ykyv02"), a(d, "class", "svelte-ykyv02"), a(b, "class", "badge svelte-ykyv02"), a(t, "class", "card entrega svelte-ykyv02"), this.first = t;
    },
    m($, V) {
      m($, t, V), u(t, n), u(n, r), re(o, r, null), u(r, i), u(r, s), u(r, c), u(r, h), u(n, g), W && W.m(n, null), u(t, v), u(t, d), u(d, y), u(d, S), u(d, D), u(d, I), u(t, k), F[E].m(t, null), u(t, P), u(t, b), u(t, w), L = !0;
    },
    p($, V) {
      e = $, /*o*/
      e[95].d !== null && W.p(e, V), T.p(U(e, E), V);
    },
    i($) {
      L || (C(o.$$.fragment, $), C(T), L = !0);
    },
    o($) {
      A(o.$$.fragment, $), A(T), L = !1;
    },
    d($) {
      $ && _(t), oe(o), W && W.d(), F[E].d();
    }
  };
}
function Zt(l) {
  let e, t, n, r, o;
  return t = new se({
    props: { name: "check-circle", size: 20 }
  }), {
    c() {
      e = p("p"), ie(t.$$.fragment), n = M(), r = N(
        /*aviso*/
        l[13]
      ), a(e, "class", "aviso svelte-ykyv02");
    },
    m(i, s) {
      m(i, e, s), re(t, e, null), u(e, n), u(e, r), o = !0;
    },
    p(i, s) {
      (!o || s[0] & /*aviso*/
      8192) && te(
        r,
        /*aviso*/
        i[13]
      );
    },
    i(i) {
      o || (C(t.$$.fragment, i), o = !0);
    },
    o(i) {
      A(t.$$.fragment, i), o = !1;
    },
    d(i) {
      i && _(e), oe(t);
    }
  };
}
function vr(l) {
  let e, t = [], n = /* @__PURE__ */ new Map(), r = de(
    /*productos*/
    l[1]
  );
  const o = (i) => (
    /*p*/
    i[88].id
  );
  for (let i = 0; i < r.length; i += 1) {
    let s = jt(l, r, i), c = o(s);
    n.set(c, t[i] = el(c, s));
  }
  return {
    c() {
      e = p("div");
      for (let i = 0; i < t.length; i += 1)
        t[i].c();
      a(e, "class", "mk-grid svelte-ykyv02");
    },
    m(i, s) {
      m(i, e, s);
      for (let c = 0; c < t.length; c += 1)
        t[c] && t[c].m(e, null);
    },
    p(i, s) {
      s[0] & /*pedirEliminar, productos, abrirEditar*/
      167772162 && (r = de(
        /*productos*/
        i[1]
      ), t = dt(t, s, o, 1, i, r, n, e, Ql, el, null, jt));
    },
    d(i) {
      i && _(e);
      for (let s = 0; s < t.length; s += 1)
        t[s].d();
    }
  };
}
function kr(l) {
  let e;
  return {
    c() {
      e = p("section"), e.innerHTML = '<p class="big center gris-texto svelte-ykyv02">Todavía no hay muebles publicados.</p>', a(e, "class", "card svelte-ykyv02");
    },
    m(t, n) {
      m(t, e, n);
    },
    p: K,
    d(t) {
      t && _(e);
    }
  };
}
function Xt(l) {
  let e, t, n;
  return {
    c() {
      e = p("img"), Nt(e.src, t = /*p*/
      l[88].imageUrl) || a(e, "src", t), a(e, "alt", n = /*p*/
      l[88].name), a(e, "class", "mk-img svelte-ykyv02");
    },
    m(r, o) {
      m(r, e, o);
    },
    p(r, o) {
      o[0] & /*productos*/
      2 && !Nt(e.src, t = /*p*/
      r[88].imageUrl) && a(e, "src", t), o[0] & /*productos*/
      2 && n !== (n = /*p*/
      r[88].name) && a(e, "alt", n);
    },
    d(r) {
      r && _(e);
    }
  };
}
function xt(l) {
  let e, t, n = (
    /*p*/
    l[88].carpenterName + ""
  ), r;
  return {
    c() {
      e = p("p"), t = N("Publicado por "), r = N(n), a(e, "class", "gris-texto svelte-ykyv02");
    },
    m(o, i) {
      m(o, e, i), u(e, t), u(e, r);
    },
    p(o, i) {
      i[0] & /*productos*/
      2 && n !== (n = /*p*/
      o[88].carpenterName + "") && te(r, n);
    },
    d(o) {
      o && _(e);
    }
  };
}
function el(l, e) {
  let t, n, r, o = (
    /*p*/
    e[88].name + ""
  ), i, s, c, f = (
    /*p*/
    e[88].category + ""
  ), h, g, v = (
    /*p*/
    e[88].woodType + ""
  ), d, y, S = (
    /*p*/
    e[88].dimensions + ""
  ), D, z, I, k, E = (
    /*p*/
    e[88].price + ""
  ), T, P, b, w = (
    /*p*/
    e[88].stock > 0 ? `${/*p*/
    e[88].stock} disponibles` : "Agotado"
  ), L, W, Y, F, Z, U, H, $, V, R, j = (
    /*p*/
    e[88].imageUrl && Xt(e)
  ), x = (
    /*p*/
    e[88].carpenterName && xt(e)
  );
  function be() {
    return (
      /*click_handler_3*/
      e[46](
        /*p*/
        e[88]
      )
    );
  }
  function Ee() {
    return (
      /*click_handler_4*/
      e[47](
        /*p*/
        e[88]
      )
    );
  }
  return {
    key: l,
    first: null,
    c() {
      t = p("section"), j && j.c(), n = M(), r = p("h2"), i = N(o), s = M(), c = p("p"), h = N(f), g = N(" · madera "), d = N(v), y = N(" · "), D = N(S), z = M(), I = p("p"), k = N("Bs "), T = N(E), P = M(), b = p("span"), L = N(w), W = M(), x && x.c(), Y = M(), F = p("div"), Z = p("button"), Z.textContent = "Editar / Stock", U = M(), H = p("button"), H.textContent = "Eliminar", $ = M(), a(r, "class", "svelte-ykyv02"), a(c, "class", "gris-texto svelte-ykyv02"), a(b, "class", "urgencia svelte-ykyv02"), ne(
        b,
        "ok",
        /*p*/
        e[88].stock > 0
      ), ne(
        b,
        "rojo",
        /*p*/
        e[88].stock <= 0
      ), a(I, "class", "mk-precio svelte-ykyv02"), a(Z, "class", "btn svelte-ykyv02"), a(H, "class", "btn gris svelte-ykyv02"), a(F, "class", "modal-btns svelte-ykyv02"), a(t, "class", "card mk-card svelte-ykyv02"), this.first = t;
    },
    m(fe, Q) {
      m(fe, t, Q), j && j.m(t, null), u(t, n), u(t, r), u(r, i), u(t, s), u(t, c), u(c, h), u(c, g), u(c, d), u(c, y), u(c, D), u(t, z), u(t, I), u(I, k), u(I, T), u(I, P), u(I, b), u(b, L), u(t, W), x && x.m(t, null), u(t, Y), u(t, F), u(F, Z), u(F, U), u(F, H), u(t, $), V || (R = [
        X(Z, "click", be),
        X(H, "click", Ee)
      ], V = !0);
    },
    p(fe, Q) {
      e = fe, /*p*/
      e[88].imageUrl ? j ? j.p(e, Q) : (j = Xt(e), j.c(), j.m(t, n)) : j && (j.d(1), j = null), Q[0] & /*productos*/
      2 && o !== (o = /*p*/
      e[88].name + "") && te(i, o), Q[0] & /*productos*/
      2 && f !== (f = /*p*/
      e[88].category + "") && te(h, f), Q[0] & /*productos*/
      2 && v !== (v = /*p*/
      e[88].woodType + "") && te(d, v), Q[0] & /*productos*/
      2 && S !== (S = /*p*/
      e[88].dimensions + "") && te(D, S), Q[0] & /*productos*/
      2 && E !== (E = /*p*/
      e[88].price + "") && te(T, E), Q[0] & /*productos*/
      2 && w !== (w = /*p*/
      e[88].stock > 0 ? `${/*p*/
      e[88].stock} disponibles` : "Agotado") && te(L, w), Q[0] & /*productos*/
      2 && ne(
        b,
        "ok",
        /*p*/
        e[88].stock > 0
      ), Q[0] & /*productos*/
      2 && ne(
        b,
        "rojo",
        /*p*/
        e[88].stock <= 0
      ), /*p*/
      e[88].carpenterName ? x ? x.p(e, Q) : (x = xt(e), x.c(), x.m(t, Y)) : x && (x.d(1), x = null);
    },
    d(fe) {
      fe && _(t), j && j.d(), x && x.d(), V = !1, we(R);
    }
  };
}
function tl(l) {
  let e, t, n, r;
  const o = [gr, br], i = [];
  function s(c, f) {
    return (
      /*chatAbierto*/
      c[15] ? 1 : 0
    );
  }
  return e = s(l), t = i[e] = o[e](l), {
    c() {
      t.c(), n = Ae();
    },
    m(c, f) {
      i[e].m(c, f), m(c, n, f), r = !0;
    },
    p(c, f) {
      let h = e;
      e = s(c), e === h ? i[e].p(c, f) : (ce(), A(i[h], 1, 1, () => {
        i[h] = null;
      }), ue(), t = i[e], t ? t.p(c, f) : (t = i[e] = o[e](c), t.c()), C(t, 1), t.m(n.parentNode, n));
    },
    i(c) {
      r || (C(t), r = !0);
    },
    o(c) {
      A(t), r = !1;
    },
    d(c) {
      c && _(n), i[e].d(c);
    }
  };
}
function br(l) {
  let e, t, n, r, o, i, s, c, f, h, g, v, d, y, S, D, z, I, k, E, T, P = (
    /*agentLoading*/
    l[19] ? "…" : "Preguntar"
  ), b, w, L, W;
  s = new se({ props: { name: "chat", size: 18 } });
  let Y = de(
    /*PREGUNTAS*/
    l[33]
  ), F = [];
  for (let $ = 0; $ < Y.length; $ += 1)
    F[$] = ll(At(l, Y, $));
  let Z = de(
    /*agentMsgs*/
    l[18]
  ), U = [];
  for (let $ = 0; $ < Z.length; $ += 1)
    U[$] = nl(It(l, Z, $));
  let H = (
    /*agentLoading*/
    l[19] && rl()
  );
  return {
    c() {
      e = p("div"), t = M(), n = p("aside"), r = p("div"), o = p("div"), i = p("span"), ie(s.$$.fragment), c = M(), f = p("div"), f.innerHTML = '<b>Asistente del taller</b><p class="panel-sub svelte-ykyv02">Pregúntame lo que necesites</p>', h = M(), g = p("button"), g.textContent = "✕", v = M(), d = p("div");
      for (let $ = 0; $ < F.length; $ += 1)
        F[$].c();
      y = M(), S = p("div");
      for (let $ = 0; $ < U.length; $ += 1)
        U[$].c();
      D = M(), H && H.c(), z = M(), I = p("div"), k = p("input"), E = M(), T = p("button"), b = N(P), a(e, "class", "chat-fondo svelte-ykyv02"), a(e, "role", "presentation"), a(i, "class", "panel-ico svelte-ykyv02"), a(o, "class", "panel-title svelte-ykyv02"), a(g, "class", "panel-cerrar svelte-ykyv02"), a(g, "aria-label", "Cerrar"), a(r, "class", "panel-top svelte-ykyv02"), a(d, "class", "chips svelte-ykyv02"), a(S, "class", "chat svelte-ykyv02"), a(k, "type", "text"), a(k, "placeholder", "Escribe tu duda aquí…"), a(k, "class", "svelte-ykyv02"), a(T, "class", "btn svelte-ykyv02"), T.disabled = /*agentLoading*/
      l[19], a(I, "class", "row panel-input svelte-ykyv02"), a(n, "class", "panel svelte-ykyv02"), a(n, "role", "dialog"), a(n, "aria-label", "Asistente del taller");
    },
    m($, V) {
      m($, e, V), m($, t, V), m($, n, V), u(n, r), u(r, o), u(o, i), re(s, i, null), u(o, c), u(o, f), u(r, h), u(r, g), u(n, v), u(n, d);
      for (let R = 0; R < F.length; R += 1)
        F[R] && F[R].m(d, null);
      u(n, y), u(n, S);
      for (let R = 0; R < U.length; R += 1)
        U[R] && U[R].m(S, null);
      u(S, D), H && H.m(S, null), l[56](S), u(n, z), u(n, I), u(I, k), ve(
        k,
        /*agentQuery*/
        l[17]
      ), u(I, E), u(I, T), u(T, b), w = !0, L || (W = [
        X(
          e,
          "click",
          /*click_handler_10*/
          l[53]
        ),
        X(
          g,
          "click",
          /*click_handler_11*/
          l[54]
        ),
        X(
          k,
          "input",
          /*input_input_handler*/
          l[57]
        ),
        X(
          k,
          "keydown",
          /*keydown_handler*/
          l[58]
        ),
        X(
          T,
          "click",
          /*click_handler_13*/
          l[59]
        )
      ], L = !0);
    },
    p($, V) {
      if (V[0] & /*agentLoading*/
      524288 | V[1] & /*ask, PREGUNTAS*/
      2052) {
        Y = de(
          /*PREGUNTAS*/
          $[33]
        );
        let R;
        for (R = 0; R < Y.length; R += 1) {
          const j = At($, Y, R);
          F[R] ? F[R].p(j, V) : (F[R] = ll(j), F[R].c(), F[R].m(d, null));
        }
        for (; R < F.length; R += 1)
          F[R].d(1);
        F.length = Y.length;
      }
      if (V[0] & /*agentMsgs*/
      262144) {
        Z = de(
          /*agentMsgs*/
          $[18]
        );
        let R;
        for (R = 0; R < Z.length; R += 1) {
          const j = It($, Z, R);
          U[R] ? U[R].p(j, V) : (U[R] = nl(j), U[R].c(), U[R].m(S, D));
        }
        for (; R < U.length; R += 1)
          U[R].d(1);
        U.length = Z.length;
      }
      /*agentLoading*/
      $[19] ? H || (H = rl(), H.c(), H.m(S, null)) : H && (H.d(1), H = null), V[0] & /*agentQuery*/
      131072 && k.value !== /*agentQuery*/
      $[17] && ve(
        k,
        /*agentQuery*/
        $[17]
      ), (!w || V[0] & /*agentLoading*/
      524288) && P !== (P = /*agentLoading*/
      $[19] ? "…" : "Preguntar") && te(b, P), (!w || V[0] & /*agentLoading*/
      524288) && (T.disabled = /*agentLoading*/
      $[19]);
    },
    i($) {
      w || (C(s.$$.fragment, $), w = !0);
    },
    o($) {
      A(s.$$.fragment, $), w = !1;
    },
    d($) {
      $ && (_(e), _(t), _(n)), oe(s), tt(F, $), tt(U, $), H && H.d(), l[56](null), L = !1, we(W);
    }
  };
}
function gr(l) {
  let e, t, n, r, o, i;
  return t = new se({ props: { name: "chat", size: 26 } }), {
    c() {
      e = p("button"), ie(t.$$.fragment), n = p("span"), n.textContent = "Ayuda", a(n, "class", "fab-label"), a(e, "class", "fab svelte-ykyv02"), a(e, "aria-label", "Asistente");
    },
    m(s, c) {
      m(s, e, c), re(t, e, null), u(e, n), r = !0, o || (i = X(
        e,
        "click",
        /*click_handler_9*/
        l[52]
      ), o = !0);
    },
    p: K,
    i(s) {
      r || (C(t.$$.fragment, s), r = !0);
    },
    o(s) {
      A(t.$$.fragment, s), r = !1;
    },
    d(s) {
      s && _(e), oe(t), o = !1, i();
    }
  };
}
function ll(l) {
  let e, t = (
    /*q*/
    l[85] + ""
  ), n, r, o;
  function i() {
    return (
      /*click_handler_12*/
      l[55](
        /*q*/
        l[85]
      )
    );
  }
  return {
    c() {
      e = p("button"), n = N(t), a(e, "class", "chip svelte-ykyv02"), e.disabled = /*agentLoading*/
      l[19];
    },
    m(s, c) {
      m(s, e, c), u(e, n), r || (o = X(e, "click", i), r = !0);
    },
    p(s, c) {
      l = s, c[0] & /*agentLoading*/
      524288 && (e.disabled = /*agentLoading*/
      l[19]);
    },
    d(s) {
      s && _(e), r = !1, o();
    }
  };
}
function nl(l) {
  let e, t = (
    /*m*/
    l[77].text + ""
  ), n;
  return {
    c() {
      e = p("div"), n = N(t), a(e, "class", "bubble svelte-ykyv02"), ne(
        e,
        "bubble-user",
        /*m*/
        l[77].role === "user"
      ), ne(
        e,
        "bubble-agent",
        /*m*/
        l[77].role === "agent"
      );
    },
    m(r, o) {
      m(r, e, o), u(e, n);
    },
    p(r, o) {
      o[0] & /*agentMsgs*/
      262144 && t !== (t = /*m*/
      r[77].text + "") && te(n, t), o[0] & /*agentMsgs*/
      262144 && ne(
        e,
        "bubble-user",
        /*m*/
        r[77].role === "user"
      ), o[0] & /*agentMsgs*/
      262144 && ne(
        e,
        "bubble-agent",
        /*m*/
        r[77].role === "agent"
      );
    },
    d(r) {
      r && _(e);
    }
  };
}
function rl(l) {
  let e;
  return {
    c() {
      e = p("div"), e.textContent = "Pensando…", a(e, "class", "bubble bubble-agent svelte-ykyv02"), ke(e, "opacity", ".6");
    },
    m(t, n) {
      m(t, e, n);
    },
    d(t) {
      t && _(e);
    }
  };
}
function ol(l) {
  let e, t, n, r, o = (
    /*prodEditando*/
    l[3] ? "Editar mueble" : "Publicar mueble"
  ), i, s, c, f, h, g, v, d, y, S, D, z, I, k, E, T, P, b, w, L, W, Y, F, Z, U, H, $, V, R, j, x, be, Ee, fe, Q, Oe, he, Pe, De, $e, Re, G, le, Me, Se, He = (
    /*prodGuardando*/
    l[5] ? "Guardando…" : "Guardar"
  ), Qe, Ze, ot, Le = de(
    /*CATEGORIAS*/
    l[21]
  ), _e = [];
  for (let q = 0; q < Le.length; q += 1)
    _e[q] = il(Ct(l, Le, q));
  let Ce = de(
    /*MADERAS*/
    l[22]
  ), me = [];
  for (let q = 0; q < Ce.length; q += 1)
    me[q] = sl(Lt(l, Ce, q));
  let ye = (
    /*prodError*/
    l[6] && al(l)
  );
  return {
    c() {
      e = p("div"), t = p("form"), n = p("p"), r = p("b"), i = N(o), s = M(), c = p("label"), f = N("Nombre"), h = p("input"), g = M(), v = p("div"), d = p("label"), y = N("Categoría"), S = p("select");
      for (let q = 0; q < _e.length; q += 1)
        _e[q].c();
      D = M(), z = p("label"), I = N("Madera"), k = p("select");
      for (let q = 0; q < me.length; q += 1)
        me[q].c();
      E = M(), T = p("label"), P = N("Medidas"), b = p("input"), w = M(), L = p("div"), W = p("label"), Y = N("Precio Bs"), F = p("input"), Z = M(), U = p("label"), H = N("Stock"), $ = p("input"), V = M(), R = p("label"), j = N("Días"), x = p("input"), be = M(), Ee = p("label"), fe = N("Descripción"), Q = p("textarea"), Oe = M(), he = p("label"), Pe = N(`Foto (se sube al bucket S3)
        `), De = p("input"), $e = M(), ye && ye.c(), Re = M(), G = p("div"), le = p("button"), le.textContent = "Cancelar", Me = M(), Se = p("button"), Qe = N(He), a(n, "class", "big svelte-ykyv02"), h.required = !0, a(h, "class", "svelte-ykyv02"), a(c, "class", "svelte-ykyv02"), a(S, "class", "svelte-ykyv02"), /*prodForm*/
      l[7].category === void 0 && nt(() => (
        /*select0_change_handler*/
        l[61].call(S)
      )), a(d, "class", "svelte-ykyv02"), a(k, "class", "svelte-ykyv02"), /*prodForm*/
      l[7].woodType === void 0 && nt(() => (
        /*select1_change_handler*/
        l[62].call(k)
      )), a(z, "class", "svelte-ykyv02"), a(v, "class", "row svelte-ykyv02"), b.required = !0, a(b, "class", "svelte-ykyv02"), a(T, "class", "svelte-ykyv02"), a(F, "type", "number"), a(F, "min", "1"), F.required = !0, a(F, "class", "svelte-ykyv02"), a(W, "class", "svelte-ykyv02"), a($, "type", "number"), a($, "min", "0"), $.required = !0, a($, "class", "svelte-ykyv02"), a(U, "class", "svelte-ykyv02"), a(x, "type", "number"), a(x, "min", "1"), a(x, "class", "svelte-ykyv02"), a(R, "class", "svelte-ykyv02"), a(L, "class", "row svelte-ykyv02"), a(Q, "rows", "3"), Q.required = !0, a(Q, "class", "svelte-ykyv02"), a(Ee, "class", "svelte-ykyv02"), a(De, "type", "file"), a(De, "accept", "image/*"), a(De, "class", "svelte-ykyv02"), a(he, "class", "svelte-ykyv02"), a(le, "type", "button"), a(le, "class", "btn gris svelte-ykyv02"), a(Se, "type", "submit"), a(Se, "class", "btn verde svelte-ykyv02"), Se.disabled = /*prodGuardando*/
      l[5], a(G, "class", "modal-btns svelte-ykyv02"), a(t, "class", "modal mk-form svelte-ykyv02"), a(e, "class", "fondo svelte-ykyv02"), a(e, "role", "presentation");
    },
    m(q, ae) {
      m(q, e, ae), u(e, t), u(t, n), u(n, r), u(r, i), u(t, s), u(t, c), u(c, f), u(c, h), ve(
        h,
        /*prodForm*/
        l[7].name
      ), u(t, g), u(t, v), u(v, d), u(d, y), u(d, S);
      for (let J = 0; J < _e.length; J += 1)
        _e[J] && _e[J].m(S, null);
      st(
        S,
        /*prodForm*/
        l[7].category,
        !0
      ), u(v, D), u(v, z), u(z, I), u(z, k);
      for (let J = 0; J < me.length; J += 1)
        me[J] && me[J].m(k, null);
      st(
        k,
        /*prodForm*/
        l[7].woodType,
        !0
      ), u(t, E), u(t, T), u(T, P), u(T, b), ve(
        b,
        /*prodForm*/
        l[7].dimensions
      ), u(t, w), u(t, L), u(L, W), u(W, Y), u(W, F), ve(
        F,
        /*prodForm*/
        l[7].price
      ), u(L, Z), u(L, U), u(U, H), u(U, $), ve(
        $,
        /*prodForm*/
        l[7].stock
      ), u(L, V), u(L, R), u(R, j), u(R, x), ve(
        x,
        /*prodForm*/
        l[7].estimatedDays
      ), u(t, be), u(t, Ee), u(Ee, fe), u(Ee, Q), ve(
        Q,
        /*prodForm*/
        l[7].description
      ), u(t, Oe), u(t, he), u(he, Pe), u(he, De), u(t, $e), ye && ye.m(t, null), u(t, Re), u(t, G), u(G, le), u(G, Me), u(G, Se), u(Se, Qe), Ze || (ot = [
        X(
          h,
          "input",
          /*input0_input_handler*/
          l[60]
        ),
        X(
          S,
          "change",
          /*select0_change_handler*/
          l[61]
        ),
        X(
          k,
          "change",
          /*select1_change_handler*/
          l[62]
        ),
        X(
          b,
          "input",
          /*input1_input_handler*/
          l[63]
        ),
        X(
          F,
          "input",
          /*input2_input_handler*/
          l[64]
        ),
        X(
          $,
          "input",
          /*input3_input_handler*/
          l[65]
        ),
        X(
          x,
          "input",
          /*input4_input_handler*/
          l[66]
        ),
        X(
          Q,
          "input",
          /*textarea_input_handler*/
          l[67]
        ),
        X(
          De,
          "change",
          /*change_handler*/
          l[68]
        ),
        X(
          le,
          "click",
          /*click_handler_14*/
          l[69]
        ),
        X(t, "submit", Bl(
          /*guardarProducto*/
          l[26]
        )),
        X(e, "click", Hl(
          /*click_handler_15*/
          l[70]
        ))
      ], Ze = !0);
    },
    p(q, ae) {
      if (ae[0] & /*prodEditando*/
      8 && o !== (o = /*prodEditando*/
      q[3] ? "Editar mueble" : "Publicar mueble") && te(i, o), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && h.value !== /*prodForm*/
      q[7].name && ve(
        h,
        /*prodForm*/
        q[7].name
      ), ae[0] & /*CATEGORIAS*/
      2097152) {
        Le = de(
          /*CATEGORIAS*/
          q[21]
        );
        let J;
        for (J = 0; J < Le.length; J += 1) {
          const ze = Ct(q, Le, J);
          _e[J] ? _e[J].p(ze, ae) : (_e[J] = il(ze), _e[J].c(), _e[J].m(S, null));
        }
        for (; J < _e.length; J += 1)
          _e[J].d(1);
        _e.length = Le.length;
      }
      if (ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && st(
        S,
        /*prodForm*/
        q[7].category
      ), ae[0] & /*MADERAS*/
      4194304) {
        Ce = de(
          /*MADERAS*/
          q[22]
        );
        let J;
        for (J = 0; J < Ce.length; J += 1) {
          const ze = Lt(q, Ce, J);
          me[J] ? me[J].p(ze, ae) : (me[J] = sl(ze), me[J].c(), me[J].m(k, null));
        }
        for (; J < me.length; J += 1)
          me[J].d(1);
        me.length = Ce.length;
      }
      ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && st(
        k,
        /*prodForm*/
        q[7].woodType
      ), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && b.value !== /*prodForm*/
      q[7].dimensions && ve(
        b,
        /*prodForm*/
        q[7].dimensions
      ), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && Ve(F.value) !== /*prodForm*/
      q[7].price && ve(
        F,
        /*prodForm*/
        q[7].price
      ), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && Ve($.value) !== /*prodForm*/
      q[7].stock && ve(
        $,
        /*prodForm*/
        q[7].stock
      ), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && Ve(x.value) !== /*prodForm*/
      q[7].estimatedDays && ve(
        x,
        /*prodForm*/
        q[7].estimatedDays
      ), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && ve(
        Q,
        /*prodForm*/
        q[7].description
      ), /*prodError*/
      q[6] ? ye ? ye.p(q, ae) : (ye = al(q), ye.c(), ye.m(t, Re)) : ye && (ye.d(1), ye = null), ae[0] & /*prodGuardando*/
      32 && He !== (He = /*prodGuardando*/
      q[5] ? "Guardando…" : "Guardar") && te(Qe, He), ae[0] & /*prodGuardando*/
      32 && (Se.disabled = /*prodGuardando*/
      q[5]);
    },
    d(q) {
      q && _(e), tt(_e, q), tt(me, q), ye && ye.d(), Ze = !1, we(ot);
    }
  };
}
function il(l) {
  let e, t = (
    /*c*/
    l[80] + ""
  ), n;
  return {
    c() {
      e = p("option"), n = N(t), e.__value = /*c*/
      l[80], ve(e, e.__value);
    },
    m(r, o) {
      m(r, e, o), u(e, n);
    },
    p: K,
    d(r) {
      r && _(e);
    }
  };
}
function sl(l) {
  let e, t = (
    /*m*/
    l[77] + ""
  ), n;
  return {
    c() {
      e = p("option"), n = N(t), e.__value = /*m*/
      l[77], ve(e, e.__value);
    },
    m(r, o) {
      m(r, e, o), u(e, n);
    },
    p: K,
    d(r) {
      r && _(e);
    }
  };
}
function al(l) {
  let e, t;
  return {
    c() {
      e = p("p"), t = N(
        /*prodError*/
        l[6]
      ), ke(e, "color", "#C0392B");
    },
    m(n, r) {
      m(n, e, r), u(e, t);
    },
    p(n, r) {
      r[0] & /*prodError*/
      64 && te(
        t,
        /*prodError*/
        n[6]
      );
    },
    d(n) {
      n && _(e);
    }
  };
}
function cl(l) {
  let e, t, n, r = (
    /*confirmacion*/
    l[14].texto + ""
  ), o, i, s, c, f, h, g, v, d, y, S;
  return g = new se({ props: { name: "check", size: 18 } }), {
    c() {
      e = p("div"), t = p("div"), n = p("p"), o = N(r), i = M(), s = p("div"), c = p("button"), c.textContent = "Todavía no", f = M(), h = p("button"), ie(g.$$.fragment), v = N(" Sí"), a(n, "class", "big center svelte-ykyv02"), a(c, "class", "btn gris svelte-ykyv02"), a(h, "class", "btn verde svelte-ykyv02"), a(s, "class", "modal-btns svelte-ykyv02"), a(t, "class", "modal svelte-ykyv02"), a(e, "class", "fondo svelte-ykyv02"), a(e, "role", "dialog"), a(e, "aria-modal", "true");
    },
    m(D, z) {
      m(D, e, z), u(e, t), u(t, n), u(n, o), u(t, i), u(t, s), u(s, c), u(s, f), u(s, h), re(g, h, null), u(h, v), d = !0, y || (S = [
        X(
          c,
          "click",
          /*click_handler_16*/
          l[71]
        ),
        X(
          h,
          "click",
          /*confirmar*/
          l[40]
        ),
        X(
          e,
          "click",
          /*click_handler_17*/
          l[72]
        )
      ], y = !0);
    },
    p(D, z) {
      (!d || z[0] & /*confirmacion*/
      16384) && r !== (r = /*confirmacion*/
      D[14].texto + "") && te(o, r);
    },
    i(D) {
      d || (C(g.$$.fragment, D), d = !0);
    },
    o(D) {
      A(g.$$.fragment, D), d = !1;
    },
    d(D) {
      D && _(e), oe(g), y = !1, we(S);
    }
  };
}
function wr(l) {
  let e, t, n, r, o, i, s;
  const c = [Hn, Bn], f = [];
  function h(y, S) {
    return (
      /*denied*/
      y[10] ? 0 : 1
    );
  }
  e = h(l), t = f[e] = c[e](l);
  let g = !/*denied*/
  l[10] && !/*cargando*/
  l[8] && tl(l), v = (
    /*prodModal*/
    l[2] && ol(l)
  ), d = (
    /*confirmacion*/
    l[14] && cl(l)
  );
  return {
    c() {
      t.c(), n = M(), g && g.c(), r = M(), v && v.c(), o = M(), d && d.c(), i = Ae();
    },
    m(y, S) {
      f[e].m(y, S), m(y, n, S), g && g.m(y, S), m(y, r, S), v && v.m(y, S), m(y, o, S), d && d.m(y, S), m(y, i, S), s = !0;
    },
    p(y, S) {
      let D = e;
      e = h(y), e === D ? f[e].p(y, S) : (ce(), A(f[D], 1, 1, () => {
        f[D] = null;
      }), ue(), t = f[e], t ? t.p(y, S) : (t = f[e] = c[e](y), t.c()), C(t, 1), t.m(n.parentNode, n)), !/*denied*/
      y[10] && !/*cargando*/
      y[8] ? g ? (g.p(y, S), S[0] & /*denied, cargando*/
      1280 && C(g, 1)) : (g = tl(y), g.c(), C(g, 1), g.m(r.parentNode, r)) : g && (ce(), A(g, 1, 1, () => {
        g = null;
      }), ue()), /*prodModal*/
      y[2] ? v ? v.p(y, S) : (v = ol(y), v.c(), v.m(o.parentNode, o)) : v && (v.d(1), v = null), /*confirmacion*/
      y[14] ? d ? (d.p(y, S), S[0] & /*confirmacion*/
      16384 && C(d, 1)) : (d = cl(y), d.c(), C(d, 1), d.m(i.parentNode, i)) : d && (ce(), A(d, 1, 1, () => {
        d = null;
      }), ue());
    },
    i(y) {
      s || (C(t), C(g), C(d), s = !0);
    },
    o(y) {
      A(t), A(g), A(d), s = !1;
    },
    d(y) {
      y && (_(n), _(r), _(o), _(i)), f[e].d(y), g && g.d(y), v && v.d(y), d && d.d(y);
    }
  };
}
function ft(l) {
  if (!l) return "sin fecha";
  const e = /* @__PURE__ */ new Date(l + (l.length === 10 ? "T12:00:00" : ""));
  return isNaN(e.getTime()) ? l : new Intl.DateTimeFormat(
    "es-ES",
    {
      weekday: "long",
      day: "numeric",
      month: "long"
    }
  ).format(e);
}
function Fe(l) {
  var e;
  return ((e = l.delivery) == null ? void 0 : e.scheduledDate) ?? l.deliveryDate ?? null;
}
function gl(l) {
  if (!l) return null;
  const e = /* @__PURE__ */ new Date();
  e.setHours(0, 0, 0, 0);
  const t = /* @__PURE__ */ new Date(l + (l.length === 10 ? "T12:00:00" : ""));
  return t.setHours(0, 0, 0, 0), Math.round((t.getTime() - e.getTime()) / 864e5);
}
function Er(l) {
  if (["DELIVERED", "CANCELLED"].includes(l.status)) return null;
  const e = gl(Fe(l));
  return e === null ? null : e < 0 ? {
    texto: `Atrasado ${-e} día${-e === 1 ? "" : "s"}`,
    nivel: "rojo"
  } : e === 0 ? { texto: "¡Para hoy!", nivel: "rojo" } : e === 1 ? {
    texto: "¡Para mañana!",
    nivel: "rojo"
  } : e <= 3 ? {
    texto: `Faltan ${e} días`,
    nivel: "ambar"
  } : {
    texto: `Faltan ${e} días`,
    nivel: "ok"
  };
}
function Ke(l) {
  return [...l.steps ?? []].sort((e, t) => e.sequence - t.sequence);
}
function bt(l) {
  return Ke(l).filter((e) => e.status === "COMPLETED").length;
}
function $r(l) {
  return Ke(l).filter((e) => e.status !== "COMPLETED").length;
}
function wl(l) {
  return Ke(l).find((e) => e.status !== "COMPLETED") ?? null;
}
function ul(l) {
  const e = Ke(l).length;
  return e ? Math.round(bt(l) / e * 100) : 0;
}
function fl(l) {
  const e = Ke(l);
  return e.length > 0 && e.every((t) => t.status === "COMPLETED");
}
function Dr(l, e, t) {
  let n = "trabajos", r = [], o = !1, i = null, s = null, c = !1, f = "";
  const h = ["Mesas", "Sillas", "Roperos", "Puertas", "Cocina"], g = ["Roble", "Mara", "Cedro", "Pino", "Melamina"], v = () => ({
    name: "",
    category: "Mesas",
    woodType: "Roble",
    dimensions: "180 x 90 x 76 cm",
    price: 1800,
    estimatedDays: 10,
    stock: 3,
    description: ""
  });
  let d = v();
  async function y() {
    t(1, r = await un().catch(() => []));
  }
  function S() {
    t(3, i = null), t(7, d = v()), t(4, s = null), t(6, f = ""), t(2, o = !0);
  }
  function D(O) {
    t(3, i = O), t(7, d = {
      name: O.name,
      category: O.category,
      woodType: O.woodType,
      dimensions: O.dimensions,
      price: O.price,
      estimatedDays: O.estimatedDays,
      stock: O.stock,
      description: O.description,
      imageUrl: O.imageUrl
    }), t(4, s = null), t(6, f = ""), t(2, o = !0);
  }
  async function z() {
    t(5, c = !0), t(6, f = "");
    try {
      let O = d.imageUrl;
      s && (O = await _n(s, "marketplace"));
      const ee = {
        ...d,
        imageUrl: O,
        price: Number(d.price),
        stock: Number(d.stock),
        estimatedDays: Number(d.estimatedDays ?? 10)
      };
      i ? await dn(i.id, ee) : await fn(ee), t(2, o = !1), t(13, Z = i ? "Mueble actualizado." : "Mueble publicado en el Marketplace."), setTimeout(() => t(13, Z = ""), 4e3), await y();
    } catch (O) {
      t(6, f = O.message);
    } finally {
      t(5, c = !1);
    }
  }
  function I(O) {
    t(14, U = {
      texto: `¿Quitar «${O.name}» del Marketplace?`,
      accion: async () => {
        await pn(O.id).catch(() => {
        }), t(13, Z = "Mueble eliminado."), setTimeout(() => t(13, Z = ""), 4e3), await y();
      }
    });
  }
  const k = {
    MARA: "Mara",
    ROBLE: "Roble",
    PINO: "Pino",
    CEDRO: "Cedro",
    CEREZO: "Cerezo",
    NOGAL: "Nogal",
    CAOBA: "Caoba",
    MDF: "MDF",
    TRIPLAY: "Triplay"
  }, E = {
    DOOR: "Puerta",
    WINDOW: "Ventana",
    TABLE: "Mesa",
    CHAIR: "Silla",
    BED: "Cama",
    WARDROBE: "Ropero",
    KITCHEN: "Mueble de cocina",
    SHELF: "Estante",
    DESK: "Escritorio",
    OTHER: "Mueble"
  }, T = {
    MORNING: "por la mañana",
    AFTERNOON: "por la tarde",
    EVENING: "por la noche"
  }, P = {
    SCHEDULED: "Programada",
    IN_TRANSIT: "En camino",
    DELIVERED: "Entregada",
    FAILED: "No se pudo entregar",
    RESCHEDULED: "Cambiada de fecha"
  };
  let b = !0, w = "", L = !1, W = "", Y = [], F, Z = "", U = null, H = !1, $, V = "", R = [
    {
      role: "agent",
      text: "Hola. Toca una pregunta o escríbeme tu duda."
    }
  ], j = !1, x = Ne(), be = null;
  const Ee = typeof window < "u" && (window.location.hostname.startsWith("taller.") || window.location.port === "4204"), fe = [
    "¿Qué tengo que hacer hoy?",
    "¿Cuándo es mi próxima entrega?",
    "¿A dónde entrego mi próximo pedido?"
  ];
  Ul(async () => {
    var O, ee;
    if (yn(), be = rn(() => {
      t(20, x = Ne());
    }), !vn()) {
      if (location.port === "4204" || location.hostname.startsWith("taller.")) {
        window.location.href = "/login";
        return;
      }
      t(10, L = !0), t(8, b = !1);
      return;
    }
    t(11, W = ((ee = (O = kt()) == null ? void 0 : O.email) == null ? void 0 : ee.split("@")[0]) ?? ""), y(), await Q(), F = setInterval(() => Q(!0), 15e3);
  }), Vl(() => {
    clearInterval(F), be && be();
  });
  async function Q(O = !1) {
    var ee;
    O || (t(8, b = !0), t(9, w = ""));
    try {
      const ge = await on(((ee = kt()) == null ? void 0 : ee.email) ?? "");
      ge && t(11, W = ge.name.split(" ")[0]);
      const Al = ge ? await sn(ge.id) : [];
      t(12, Y = Al.sort((Ol, Pl) => {
        const Rl = Fe(Ol) ?? "9999", zl = Fe(Pl) ?? "9999";
        return Rl.localeCompare(zl);
      })), !ge && !O && t(9, w = "No encontré tu ficha de carpintero. Pide al administrador que revise tu correo.");
    } catch {
      O || t(9, w = "No se pudo cargar la información. Toca Reintentar.");
    } finally {
      t(8, b = !1);
    }
  }
  function Oe() {
    for (const O of Y) {
      if (["DELIVERED", "CANCELLED"].includes(O.status)) continue;
      const ee = wl(O);
      if (ee) return { order: O, paso: ee };
    }
    return null;
  }
  function he() {
    return Y.filter((O) => {
      var ee;
      return ((ee = O.delivery) == null ? void 0 : ee.scheduledDate) && !["DELIVERED"].includes(O.delivery.status);
    }).map((O) => ({
      ...O,
      d: gl(O.delivery.scheduledDate)
    })).sort((O, ee) => (O.d ?? 9999) - (ee.d ?? 9999));
  }
  function Pe() {
    return Y.reduce(
      (O, ee) => O + (["DELIVERED", "CANCELLED"].includes(ee.status) ? 0 : $r(ee)),
      0
    );
  }
  function De() {
    return Y.filter((O) => !["DELIVERED", "CANCELLED"].includes(O.status));
  }
  function $e(O) {
    const ee = O.status === "PENDING";
    t(14, U = {
      texto: ee ? `¿Vas a empezar «${O.name}»?` : `¿Ya terminaste «${O.name}»?`,
      accion: async () => {
        const ge = await an(O.id, ee ? "IN_PROGRESS" : "COMPLETED");
        t(13, Z = ge != null && ge.error ? `No se pudo guardar: ${ge.error}` : ee ? "Paso empezado. ¡Manos a la obra!" : "Muy bien. Paso terminado."), await Q(!0), setTimeout(() => t(13, Z = ""), 4e3);
      }
    });
  }
  async function Re() {
    const O = U == null ? void 0 : U.accion;
    t(14, U = null), O && await O();
  }
  function G() {
    kn(), window.location.href = "/login";
  }
  async function le(O) {
    const ee = (O ?? V).trim();
    if (!(!ee || j)) {
      t(17, V = ""), t(18, R = [...R, { role: "user", text: ee }]), t(19, j = !0);
      try {
        const ge = await cn(ee);
        t(18, R = [
          ...R,
          {
            role: "agent",
            text: ge.answer ?? "No supe responder."
          }
        ]);
      } catch {
        t(18, R = [
          ...R,
          {
            role: "agent",
            text: "El asistente no está disponible ahora."
          }
        ]);
      } finally {
        t(19, j = !1);
      }
      setTimeout(
        () => $ == null ? void 0 : $.scrollTo({
          top: $.scrollHeight,
          behavior: "smooth"
        }),
        50
      );
    }
  }
  const Me = () => {
    nn(), t(20, x = Ne()), Q(!0), y();
  }, Se = () => t(0, n = "trabajos"), He = () => {
    t(0, n = "marketplace"), y();
  }, Qe = (O) => D(O), Ze = (O) => I(O), ot = () => Q(), Le = (O) => $e(O.paso), _e = (O) => $e(O), Ce = (O) => $e(O), me = () => t(15, H = !0), ye = () => t(15, H = !1), q = () => t(15, H = !1), ae = (O) => le(O);
  function J(O) {
    mt[O ? "unshift" : "push"](() => {
      $ = O, t(16, $);
    });
  }
  function ze() {
    V = this.value, t(17, V);
  }
  const El = (O) => O.key === "Enter" && le(), $l = () => le();
  function Dl() {
    d.name = this.value, t(7, d), t(21, h);
  }
  function Nl() {
    d.category = Tt(this), t(7, d), t(21, h);
  }
  function Tl() {
    d.woodType = Tt(this), t(7, d), t(21, h);
  }
  function Sl() {
    d.dimensions = this.value, t(7, d), t(21, h);
  }
  function Ml() {
    d.price = Ve(this.value), t(7, d), t(21, h);
  }
  function Ll() {
    d.stock = Ve(this.value), t(7, d), t(21, h);
  }
  function Cl() {
    d.estimatedDays = Ve(this.value), t(7, d), t(21, h);
  }
  function Il() {
    d.description = this.value, t(7, d), t(21, h);
  }
  return [
    n,
    r,
    o,
    i,
    s,
    c,
    f,
    d,
    b,
    w,
    L,
    W,
    Y,
    Z,
    U,
    H,
    $,
    V,
    R,
    j,
    x,
    h,
    g,
    y,
    S,
    D,
    z,
    I,
    k,
    E,
    T,
    P,
    Ee,
    fe,
    Q,
    Oe,
    he,
    Pe,
    De,
    $e,
    Re,
    G,
    le,
    Me,
    Se,
    He,
    Qe,
    Ze,
    ot,
    Le,
    _e,
    Ce,
    me,
    ye,
    q,
    ae,
    J,
    ze,
    El,
    $l,
    Dl,
    Nl,
    Tl,
    Sl,
    Ml,
    Ll,
    Cl,
    Il,
    (O) => {
      var ee;
      return t(4, s = ((ee = O.currentTarget.files) == null ? void 0 : ee[0]) ?? null);
    },
    () => t(2, o = !1),
    () => t(2, o = !1),
    () => t(14, U = null),
    () => t(14, U = null)
  ];
}
class Nr extends vl {
  constructor(e) {
    super(), yl(this, e, Dr, wr, _l, {}, null, [-1, -1, -1, -1]);
  }
}
let xe = null, Xe = null;
async function Ar() {
  if (!Xe) {
    Xe = document.createElement("link"), Xe.rel = "stylesheet";
    const l = typeof window < "u" ? window.location.hostname : "localhost", e = typeof window < "u" && window.location.protocol === "https:", t = l.replace(/^(www|admin|taller|api)\./, ""), n = e ? `https://taller.${t}` : `http://${l}:4204`;
    Xe.href = `${n}/mfe-assets/style.css`, document.head.appendChild(Xe);
  }
}
async function Or(l) {
  const e = (l == null ? void 0 : l.domElement) ?? document.getElementById("workshop-slot");
  if (!e) throw new Error("workshop-slot no encontrado");
  xe = new Nr({ target: e });
}
async function Pr() {
  xe == null || xe.$destroy(), xe = null;
}
export {
  Ar as bootstrap,
  Or as mount,
  Pr as unmount
};
