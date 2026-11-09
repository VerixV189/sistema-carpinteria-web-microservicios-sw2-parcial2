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
let ot;
function Nt(l, e) {
  return l === e ? !0 : (ot || (ot = document.createElement("a")), ot.href = e, l === ot.href);
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
function D(l) {
  return document.createTextNode(l);
}
function T() {
  return D(" ");
}
function Oe() {
  return D("");
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
function ie(l, e, t) {
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
let yt = !1;
function Yl() {
  yt || (yt = !0, Wl.then(yl));
}
function nt(l) {
  We.push(l);
}
const _t = /* @__PURE__ */ new Set();
let Ge = 0;
function yl() {
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
  yt = !1, _t.clear(), et(l);
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
function L(l, e) {
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
function dt(l, e, t, n, r, i, o, s, c, f, y, g) {
  let k = l.length, d = i.length, v = k;
  const M = {};
  for (; v--; ) M[l[v].key] = v;
  const E = [], z = /* @__PURE__ */ new Map(), O = /* @__PURE__ */ new Map(), h = [];
  for (v = d; v--; ) {
    const b = g(r, i, v), w = t(b);
    let C = o.get(w);
    C ? h.push(() => C.p(b, e)) : (C = f(w, b), C.c()), z.set(w, E[v] = C), w in M && O.set(w, Math.abs(v - M[w]));
  }
  const N = /* @__PURE__ */ new Set(), S = /* @__PURE__ */ new Set();
  function I(b) {
    L(b, 1), b.m(s, y), o.set(b.key, b), y = b.first, d--;
  }
  for (; k && d; ) {
    const b = E[d - 1], w = l[k - 1], C = b.key, W = w.key;
    b === w ? (y = b.first, k--, d--) : z.has(W) ? !o.has(C) || N.has(C) ? I(b) : S.has(W) ? k-- : O.get(C) > O.get(W) ? (S.add(C), I(b)) : (N.add(W), k--) : (c(w, o), k--);
  }
  for (; k--; ) {
    const b = l[k];
    z.has(b.key) || c(b, o);
  }
  for (; d; ) I(E[d - 1]);
  return we(h), E;
}
function oe(l) {
  l && l.c();
}
function le(l, e, t) {
  const { fragment: n, after_update: r } = l.$$;
  n && n.m(e, t), nt(() => {
    const i = l.$$.on_mount.map(dl).filter(pl);
    l.$$.on_destroy ? l.$$.on_destroy.push(...i) : we(i), l.$$.on_mount = [];
  }), r.forEach(nt);
}
function ne(l, e) {
  const t = l.$$;
  t.fragment !== null && (Kl(t.after_update), we(t.on_destroy), t.fragment && t.fragment.d(e), t.on_destroy = t.fragment = null, t.ctx = []);
}
function Zl(l, e) {
  l.$$.dirty[0] === -1 && (Ue.push(l), Yl(), l.$$.dirty.fill(0)), l.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}
function hl(l, e, t, n, r, i, o = null, s = [-1]) {
  const c = lt;
  et(l);
  const f = l.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: i,
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
  o && o(f.root);
  let y = !1;
  if (f.ctx = t ? t(l, e.props || {}, (g, k, ...d) => {
    const v = d.length ? d[0] : k;
    return f.ctx && r(f.ctx[g], f.ctx[g] = v) && (!f.skip_bound && f.bound[g] && f.bound[g](v), y && Zl(l, g)), k;
  }) : [], f.update(), y = !0, we(f.before_update), f.fragment = n ? n(f.ctx) : !1, e.target) {
    if (e.hydrate) {
      const g = Gl(e.target);
      f.fragment && f.fragment.l(g), g.forEach(_);
    } else
      f.fragment && f.fragment.c();
    e.intro && L(l.$$.fragment), le(l, e.target, e.anchor), yl();
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
    ne(this, 1), this.$destroy = K;
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
const kl = typeof window < "u" ? window.location.hostname : "localhost", xl = typeof window < "u" && window.location.protocol === "https:", en = kl.replace(/^(www|admin|taller|api)\./, ""), wt = xl ? `https://api.${en}` : `http://${kl}:3000`, rt = `${wt}/api`, tn = `${wt}/api/ai`, ln = `${wt}/graphql`, ht = "carpinteria_force_offline", qe = "carpinteria_net_failed", vt = "carpinteria:network-change", pe = {
  carpenters: "carpinteria_cache_carpenters",
  orders: "carpinteria_cache_orders",
  deliveries: "carpinteria_cache_deliveries",
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
  return typeof localStorage < "u" && localStorage.getItem(ht) === "1";
}
function Ne() {
  return typeof window > "u" ? !1 : !!(bl() || !navigator.onLine || sessionStorage.getItem(qe) === "1");
}
function nn(l) {
  !bl() ? localStorage.setItem(ht, "1") : (localStorage.removeItem(ht), sessionStorage.removeItem(qe)), Je();
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
      (i) => {
        var o;
        return ((o = i.email) == null ? void 0 : o.toLowerCase()) === l.toLowerCase();
      }
    );
    return r ? { id: r.id, name: r.name } : { id: at.id, name: l.split("@")[0] || at.name };
  } catch {
    sessionStorage.setItem(qe, "1"), Je();
    const t = Te(pe.carpenters, [at]), n = t.find((r) => {
      var i;
      return ((i = r.email) == null ? void 0 : i.toLowerCase()) === l.toLowerCase();
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
    const i = await $t(
      "mutation($id: ID!, $status: StepStatus!) { updateStepStatus(stepId: $id, status: $status) { id status } }",
      { id: l, status: e }
    );
    return ((t = i.data) == null ? void 0 : t.updateStepStatus) ?? { error: (r = (n = i.errors) == null ? void 0 : n[0]) == null ? void 0 : r.message };
  } catch {
    sessionStorage.setItem(qe, "1"), Je();
    const i = Te(pe.orders, Et).map((o) => ({
      ...o,
      steps: (o.steps ?? []).map((s) => String(s.id) === String(l) ? { ...s, status: e } : s)
    }));
    return Ie(pe.orders, i), { id: l, status: e, offline: !0 };
  }
}
function Mt(l) {
  var i, o, s;
  const e = l.toLowerCase(), t = Te(pe.orders, Et), n = Te(pe.products, Ye), r = t.filter((c) => !["DELIVERED", "CANCELLED"].includes(c.status));
  if (e.includes("hacer hoy") || e.includes("trabajo") || e.includes("pendiente") || e.includes("paso")) {
    if (r.length === 0)
      return { source: "local-ai", answer: "[IA Local Taller] ¡Felicidades! No tienes pedidos pendientes por fabricar hoy." };
    const c = r.map((f) => {
      var g;
      const y = (f.steps ?? []).find((k) => k.status !== "COMPLETED");
      return `• Pedido #${f.id} (${f.description}) para ${((g = f.client) == null ? void 0 : g.name) ?? "Cliente"} → Siguiente paso: ${(y == null ? void 0 : y.name) ?? "Listo para entregar"}`;
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
    const c = r.filter((k) => {
      var d;
      return ((d = k.delivery) == null ? void 0 : d.scheduledDate) || k.deliveryDate;
    });
    if (c.length === 0)
      return { source: "local-ai", answer: "[IA Local Taller] Ninguno de tus pedidos activos tiene fecha de entrega programada todavía." };
    const f = c[0], y = ((i = f.delivery) == null ? void 0 : i.address) ?? f.deliveryAddress ?? "Recojo en taller", g = ((o = f.delivery) == null ? void 0 : o.scheduledDate) ?? f.deliveryDate;
    return {
      source: "local-ai",
      answer: `[IA Local Taller — Sin Internet]
Tu próxima entrega es el pedido #${f.id} (${f.description}):
• Fecha: ${g}
• Cliente: ${((s = f.client) == null ? void 0 : s.name) ?? "Cliente"}
• Destino: ${y}`
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
    const i = new FileReader();
    i.onload = () => n(i.result), i.onerror = r, i.readAsDataURL(l);
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
function yn(l) {
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
function hn() {
  const l = new URLSearchParams(window.location.search), e = l.get("token");
  if (!e) return;
  const t = { token: e, email: l.get("email") ?? "", role: yn(e) };
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
  let e, t, n, r, i;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), r = B("path"), i = B("path"), a(e, "d", "m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"), a(t, "d", "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"), a(n, "d", "M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"), a(r, "d", "M2 7h20"), a(i, "d", "M22 7v3a2 2 0 0 1-2 2 2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7");
    },
    m(o, s) {
      m(o, e, s), m(o, t, s), m(o, n, s), m(o, r, s), m(o, i, s);
    },
    d(o) {
      o && (_(e), _(t), _(n), _(r), _(i));
    }
  };
}
function wn(l) {
  let e, t, n, r, i, o, s, c;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), r = B("path"), i = B("path"), o = B("path"), s = B("path"), c = B("path"), a(e, "d", "M5.8 11.3 2 22l10.7-3.79"), a(t, "d", "M4 3h.01"), a(n, "d", "M22 8h.01"), a(r, "d", "M15 2h.01"), a(i, "d", "M22 20h.01"), a(o, "d", "m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"), a(s, "d", "m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"), a(c, "d", "m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7");
    },
    m(f, y) {
      m(f, e, y), m(f, t, y), m(f, n, y), m(f, r, y), m(f, i, y), m(f, o, y), m(f, s, y), m(f, c, y);
    },
    d(f) {
      f && (_(e), _(t), _(n), _(r), _(i), _(o), _(s), _(c));
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
    m(r, i) {
      m(r, e, i), m(r, t, i), m(r, n, i);
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
    m(r, i) {
      m(r, e, i), m(r, t, i), m(r, n, i);
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
    m(r, i) {
      m(r, e, i), m(r, t, i), m(r, n, i);
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
function On(l) {
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
function An(l) {
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
  let e, t, n, r, i;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), r = B("circle"), i = B("circle"), a(e, "d", "M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"), a(t, "d", "M15 18h-5"), a(n, "d", "M14 9h4l4 4v4a1 1 0 0 1-1 1h-2"), a(r, "cx", "17"), a(r, "cy", "18"), a(r, "r", "2"), a(i, "cx", "7"), a(i, "cy", "18"), a(i, "r", "2");
    },
    m(o, s) {
      m(o, e, s), m(o, t, s), m(o, n, s), m(o, r, s), m(o, i, s);
    },
    d(o) {
      o && (_(e), _(t), _(n), _(r), _(i));
    }
  };
}
function Rn(l) {
  let e, t, n;
  return {
    c() {
      e = B("path"), t = B("path"), n = B("path"), a(e, "d", "m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9"), a(t, "d", "m18 15 4-4"), a(n, "d", "m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4V10l2 2h1.172a2 2 0 0 1 1.414.586L18.5 14.5");
    },
    m(r, i) {
      m(r, e, i), m(r, t, i), m(r, n, i);
    },
    d(r) {
      r && (_(e), _(t), _(n));
    }
  };
}
function zn(l) {
  let e;
  function t(i, o) {
    if (
      /*name*/
      i[0] === "hammer"
    ) return Rn;
    if (
      /*name*/
      i[0] === "truck"
    ) return Pn;
    if (
      /*name*/
      i[0] === "calendar"
    ) return An;
    if (
      /*name*/
      i[0] === "check"
    ) return On;
    if (
      /*name*/
      i[0] === "check-circle"
    ) return In;
    if (
      /*name*/
      i[0] === "clock"
    ) return Cn;
    if (
      /*name*/
      i[0] === "chat"
    ) return Ln;
    if (
      /*name*/
      i[0] === "pin"
    ) return Mn;
    if (
      /*name*/
      i[0] === "alert"
    ) return Sn;
    if (
      /*name*/
      i[0] === "play"
    ) return Tn;
    if (
      /*name*/
      i[0] === "logout"
    ) return Nn;
    if (
      /*name*/
      i[0] === "clipboard"
    ) return Dn;
    if (
      /*name*/
      i[0] === "user"
    ) return $n;
    if (
      /*name*/
      i[0] === "flag"
    ) return En;
    if (
      /*name*/
      i[0] === "party"
    ) return wn;
    if (
      /*name*/
      i[0] === "store"
    ) return gn;
    if (
      /*name*/
      i[0] === "navigation"
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
    m(i, o) {
      m(i, e, o), r && r.m(e, null);
    },
    p(i, [o]) {
      n !== (n = t(i)) && (r && r.d(1), r = n && n(i), r && (r.c(), r.m(e, null))), o & /*size*/
      2 && a(
        e,
        "width",
        /*size*/
        i[1]
      ), o & /*size*/
      2 && a(
        e,
        "height",
        /*size*/
        i[1]
      );
    },
    i: K,
    o: K,
    d(i) {
      i && _(e), r && r.d();
    }
  };
}
function jn(l, e, t) {
  let { name: n } = e, { size: r = 20 } = e;
  return l.$$set = (i) => {
    "name" in i && t(0, n = i.name), "size" in i && t(1, r = i.size);
  }, [n, r];
}
class se extends vl {
  constructor(e) {
    super(), hl(this, e, jn, zn, _l, { name: 0, size: 1 });
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
function Ot(l, e, t) {
  const n = l.slice();
  return n[85] = e[t], n;
}
function At(l, e, t) {
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
  const i = wl(
    /*o*/
    n[95]
  );
  n[101] = i;
  const o = Er(
    /*o*/
    n[95]
  );
  return n[102] = o, n;
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
  const i = (
    /*entregasProximas*/
    e[36]()
  );
  return e[94] = i, e;
}
function Bn(l) {
  let e, t, n, r, i, o, s, c, f, y, g, k, d, v, M, E, z, O = (
    /*isStandalone*/
    l[32] && Gn(l)
  ), h = (
    /*isStandalone*/
    l[32] && /*offline*/
    l[20] && Ft()
  );
  o = new se({ props: { name: "clipboard", size: 18 } }), y = new se({ props: { name: "store", size: 18 } });
  const N = [Yn, Wn, Vn, Un], S = [];
  function I(w, C) {
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
  function b(w, C) {
    return C === 3 ? qn(w) : w;
  }
  return d = I(l), v = S[d] = N[d](b(l, d)), {
    c() {
      O && O.c(), e = T(), t = p("main"), h && h.c(), n = T(), r = p("div"), i = p("button"), oe(o.$$.fragment), s = D(" Mis trabajos"), c = T(), f = p("button"), oe(y.$$.fragment), g = D(" Muebles en venta"), k = T(), v.c(), a(i, "class", "tab svelte-ykyv02"), ie(
        i,
        "tab-on",
        /*tab*/
        l[0] === "trabajos"
      ), a(f, "class", "tab svelte-ykyv02"), ie(
        f,
        "tab-on",
        /*tab*/
        l[0] === "marketplace"
      ), a(r, "class", "tabs svelte-ykyv02"), a(t, "class", "svelte-ykyv02"), ie(
        t,
        "con-chat",
        /*chatAbierto*/
        l[15]
      );
    },
    m(w, C) {
      O && O.m(w, C), m(w, e, C), m(w, t, C), h && h.m(t, null), u(t, n), u(t, r), u(r, i), le(o, i, null), u(i, s), u(r, c), u(r, f), le(y, f, null), u(f, g), u(t, k), S[d].m(t, null), M = !0, E || (z = [
        X(
          i,
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
      ], E = !0);
    },
    p(w, C) {
      /*isStandalone*/
      w[32] && O.p(w, C), /*isStandalone*/
      w[32] && /*offline*/
      w[20] ? h || (h = Ft(), h.c(), h.m(t, n)) : h && (h.d(1), h = null), (!M || C[0] & /*tab*/
      1) && ie(
        i,
        "tab-on",
        /*tab*/
        w[0] === "trabajos"
      ), (!M || C[0] & /*tab*/
      1) && ie(
        f,
        "tab-on",
        /*tab*/
        w[0] === "marketplace"
      );
      let W = d;
      d = I(w), d === W ? S[d].p(b(w, d), C) : (ce(), A(S[W], 1, 1, () => {
        S[W] = null;
      }), ue(), v = S[d], v ? v.p(b(w, d), C) : (v = S[d] = N[d](b(w, d)), v.c()), L(v, 1), v.m(t, null)), (!M || C[0] & /*chatAbierto*/
      32768) && ie(
        t,
        "con-chat",
        /*chatAbierto*/
        w[15]
      );
    },
    i(w) {
      M || (L(O), L(o.$$.fragment, w), L(y.$$.fragment, w), L(v), M = !0);
    },
    o(w) {
      A(O), A(o.$$.fragment, w), A(y.$$.fragment, w), A(v), M = !1;
    },
    d(w) {
      w && (_(e), _(t)), O && O.d(w), h && h.d(), ne(o), ne(y), S[d].d(), E = !1, we(z);
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
  let e, t, n, r, i, o, s, c = (
    /*offline*/
    l[20] ? "⚡ Offline · IA Local" : "● Online"
  ), f, y, g, k, d, v, M, E, z, O, h, N, S;
  return n = new se({ props: { name: "hammer", size: 22 } }), z = new se({ props: { name: "logout", size: 15 } }), {
    c() {
      e = p("header"), t = p("div"), oe(n.$$.fragment), r = p("strong"), r.textContent = "Mi Taller", i = T(), o = p("div"), s = p("button"), f = D(c), y = T(), g = p("span"), k = D("Hola, "), d = p("b"), v = D(
        /*nombre*/
        l[11]
      ), M = T(), E = p("button"), oe(z.$$.fragment), O = D(" Salir"), a(r, "class", "svelte-ykyv02"), a(t, "class", "brand svelte-ykyv02"), a(s, "class", "out svelte-ykyv02"), ke(
        s,
        "background",
        /*offline*/
        l[20] ? "#fef3c7" : "#dcfce7"
      ), ke(
        s,
        "color",
        /*offline*/
        l[20] ? "#92400e" : "#166534"
      ), ke(
        s,
        "border-color",
        /*offline*/
        l[20] ? "#f59e0b" : "#86efac"
      ), ke(s, "font-weight", "700"), a(g, "class", "hola svelte-ykyv02"), a(E, "class", "out svelte-ykyv02"), a(o, "class", "who svelte-ykyv02"), a(e, "class", "topbar svelte-ykyv02");
    },
    m(I, b) {
      m(I, e, b), u(e, t), le(n, t, null), u(t, r), u(e, i), u(e, o), u(o, s), u(s, f), u(o, y), u(o, g), u(g, k), u(g, d), u(d, v), u(o, M), u(o, E), le(z, E, null), u(E, O), h = !0, N || (S = [
        X(
          s,
          "click",
          /*click_handler*/
          l[43]
        ),
        X(
          E,
          "click",
          /*salir*/
          l[41]
        )
      ], N = !0);
    },
    p(I, b) {
      (!h || b[0] & /*offline*/
      1048576) && c !== (c = /*offline*/
      I[20] ? "⚡ Offline · IA Local" : "● Online") && te(f, c), (!h || b[0] & /*offline*/
      1048576) && ke(
        s,
        "background",
        /*offline*/
        I[20] ? "#fef3c7" : "#dcfce7"
      ), (!h || b[0] & /*offline*/
      1048576) && ke(
        s,
        "color",
        /*offline*/
        I[20] ? "#92400e" : "#166534"
      ), (!h || b[0] & /*offline*/
      1048576) && ke(
        s,
        "border-color",
        /*offline*/
        I[20] ? "#f59e0b" : "#86efac"
      ), (!h || b[0] & /*nombre*/
      2048) && te(
        v,
        /*nombre*/
        I[11]
      );
    },
    i(I) {
      h || (L(n.$$.fragment, I), L(z.$$.fragment, I), h = !0);
    },
    o(I) {
      A(n.$$.fragment, I), A(z.$$.fragment, I), h = !1;
    },
    d(I) {
      I && _(e), ne(n), ne(z), N = !1, we(S);
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
  let e, t, n, r, i, o, s = (
    /*activosN*/
    l[92] + ""
  ), c, f, y = (
    /*activosN*/
    l[92] === 1 ? "" : "s"
  ), g, k, d = (
    /*activosN*/
    l[92] === 1 ? "" : "s"
  ), v, M, E, z, O, h, N, S, I, b, w, C, W, Y, F, Z, U, H, $, V, R, j = (
    /*aviso*/
    l[13] && qt(l)
  );
  const x = [Qn, Kn, Jn], be = [];
  function Ee(G, re) {
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
  S = new se({ props: { name: "clipboard", size: 22 } });
  const Ae = [lr, tr], ye = [];
  function Pe(G, re) {
    return (
      /*orders*/
      G[12].length === 0 ? 0 : 1
    );
  }
  w = Pe(l), C = ye[w] = Ae[w](l), Z = new se({ props: { name: "truck", size: 22 } });
  const De = [dr, fr], $e = [];
  function Re(G, re) {
    return (
      /*proximas*/
      G[94].length === 0 ? 0 : 1
    );
  }
  return $ = Re(l), V = $e[$] = De[$](l), {
    c() {
      j && j.c(), e = T(), t = p("section"), r.c(), i = T(), o = p("p"), c = D(s), f = D(" trabajo"), g = D(y), k = D(" activo"), v = D(d), M = T(), fe && fe.c(), E = T(), Q && Q.c(), z = T(), O = p("div"), h = p("div"), N = p("h1"), oe(S.$$.fragment), I = D(" Mis trabajos"), b = T(), C.c(), W = T(), Y = p("aside"), F = p("h1"), oe(Z.$$.fragment), U = D(" Próximas entregas"), H = T(), V.c(), a(o, "class", "hero-resumen svelte-ykyv02"), a(t, "class", "hero svelte-ykyv02"), a(N, "class", "svelte-ykyv02"), a(h, "class", "col-principal svelte-ykyv02"), a(F, "class", "svelte-ykyv02"), a(Y, "class", "col-lado svelte-ykyv02"), a(O, "class", "cols svelte-ykyv02");
    },
    m(G, re) {
      j && j.m(G, re), m(G, e, re), m(G, t, re), be[n].m(t, null), u(t, i), u(t, o), u(o, c), u(o, f), u(o, g), u(o, k), u(o, v), u(o, M), fe && fe.m(o, null), u(o, E), Q && Q.m(o, null), m(G, z, re), m(G, O, re), u(O, h), u(h, N), le(S, N, null), u(N, I), u(h, b), ye[w].m(h, null), u(O, W), u(O, Y), u(Y, F), le(Z, F, null), u(F, U), u(Y, H), $e[$].m(Y, null), R = !0;
    },
    p(G, re) {
      /*aviso*/
      G[13] ? j ? (j.p(G, re), re[0] & /*aviso*/
      8192 && L(j, 1)) : (j = qt(G), j.c(), L(j, 1), j.m(e.parentNode, e)) : j && (ce(), A(j, 1, 1, () => {
        j = null;
      }), ue()), r.p(G, re), /*pendientesN*/
      G[93] > 0 && fe.p(G, re), /*proximas*/
      G[94].length > 0 && Q.p(G, re);
      let Me = w;
      w = Pe(G), w === Me ? ye[w].p(G, re) : (ce(), A(ye[Me], 1, 1, () => {
        ye[Me] = null;
      }), ue(), C = ye[w], C ? C.p(G, re) : (C = ye[w] = Ae[w](G), C.c()), L(C, 1), C.m(h, null)), V.p(G, re);
    },
    i(G) {
      R || (L(j), L(r), L(S.$$.fragment, G), L(C), L(Z.$$.fragment, G), L(V), R = !0);
    },
    o(G) {
      A(j), A(r), A(S.$$.fragment, G), A(C), A(Z.$$.fragment, G), A(V), R = !1;
    },
    d(G) {
      G && (_(e), _(t), _(z), _(O)), j && j.d(G), be[n].d(), fe && fe.d(), Q && Q.d(), ne(S), ye[w].d(), ne(Z), $e[$].d();
    }
  };
}
function Vn(l) {
  let e, t, n, r, i, o, s;
  return {
    c() {
      e = p("section"), t = p("p"), n = D(
        /*error*/
        l[9]
      ), r = T(), i = p("button"), i.textContent = "Reintentar", a(t, "class", "big svelte-ykyv02"), a(i, "class", "btn grande svelte-ykyv02"), a(e, "class", "card svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), u(e, t), u(t, n), u(e, r), u(e, i), o || (s = X(
        i,
        "click",
        /*click_handler_5*/
        l[48]
      ), o = !0);
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
      c && _(e), o = !1, s();
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
  let e, t, n, r, i, o = (
    /*productos*/
    l[1].length + ""
  ), s, c, f, y, g, k, d, v, M, E = (
    /*aviso*/
    l[13] && Zt(l)
  );
  r = new se({ props: { name: "store", size: 22 } });
  function z(N, S) {
    return (
      /*productos*/
      N[1].length === 0 ? kr : vr
    );
  }
  let O = z(l), h = O(l);
  return {
    c() {
      E && E.c(), e = T(), t = p("div"), n = p("h1"), oe(r.$$.fragment), i = D(" Muebles en venta ("), s = D(o), c = D(")"), f = T(), y = p("button"), y.textContent = "+ Publicar mueble", g = T(), h.c(), k = Oe(), a(n, "class", "svelte-ykyv02"), a(y, "class", "btn verde svelte-ykyv02"), a(t, "class", "mk-head svelte-ykyv02");
    },
    m(N, S) {
      E && E.m(N, S), m(N, e, S), m(N, t, S), u(t, n), le(r, n, null), u(n, i), u(n, s), u(n, c), u(t, f), u(t, y), m(N, g, S), h.m(N, S), m(N, k, S), d = !0, v || (M = X(
        y,
        "click",
        /*abrirNuevo*/
        l[24]
      ), v = !0);
    },
    p(N, S) {
      /*aviso*/
      N[13] ? E ? (E.p(N, S), S[0] & /*aviso*/
      8192 && L(E, 1)) : (E = Zt(N), E.c(), L(E, 1), E.m(e.parentNode, e)) : E && (ce(), A(E, 1, 1, () => {
        E = null;
      }), ue()), (!d || S[0] & /*productos*/
      2) && o !== (o = /*productos*/
      N[1].length + "") && te(s, o), O === (O = z(N)) && h ? h.p(N, S) : (h.d(1), h = O(N), h && (h.c(), h.m(k.parentNode, k)));
    },
    i(N) {
      d || (L(E), L(r.$$.fragment, N), d = !0);
    },
    o(N) {
      A(E), A(r.$$.fragment, N), d = !1;
    },
    d(N) {
      N && (_(e), _(t), _(g), _(k)), E && E.d(N), ne(r), h.d(N), v = !1, M();
    }
  };
}
function qt(l) {
  let e, t, n, r, i;
  return t = new se({
    props: { name: "check-circle", size: 20 }
  }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = T(), r = D(
        /*aviso*/
        l[13]
      ), a(e, "class", "aviso svelte-ykyv02");
    },
    m(o, s) {
      m(o, e, s), le(t, e, null), u(e, n), u(e, r), i = !0;
    },
    p(o, s) {
      (!i || s[0] & /*aviso*/
      8192) && te(
        r,
        /*aviso*/
        o[13]
      );
    },
    i(o) {
      i || (L(t.$$.fragment, o), i = !0);
    },
    o(o) {
      A(t.$$.fragment, o), i = !1;
    },
    d(o) {
      o && _(e), ne(t);
    }
  };
}
function Jn(l) {
  let e, t, n, r, i, o, s, c;
  return t = new se({
    props: { name: "check-circle", size: 16 }
  }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = D(" Todo terminado"), r = T(), i = p("p"), i.textContent = "Completaste todos los pasos", o = T(), s = p("p"), s.textContent = "Espera a que el encargado revise el trabajo.", a(e, "class", "hero-label svelte-ykyv02"), a(i, "class", "hero-paso svelte-ykyv02"), a(s, "class", "hero-trabajo svelte-ykyv02");
    },
    m(f, y) {
      m(f, e, y), le(t, e, null), u(e, n), m(f, r, y), m(f, i, y), m(f, o, y), m(f, s, y), c = !0;
    },
    p: K,
    i(f) {
      c || (L(t.$$.fragment, f), c = !0);
    },
    o(f) {
      A(t.$$.fragment, f), c = !1;
    },
    d(f) {
      f && (_(e), _(r), _(i), _(o), _(s)), ne(t);
    }
  };
}
function Kn(l) {
  let e, t, n, r, i, o, s, c;
  return t = new se({
    props: { name: "check-circle", size: 16 }
  }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = D(" Todo en orden"), r = T(), i = p("p"), i.textContent = "No tienes trabajos pendientes", o = T(), s = p("p"), s.textContent = "Cuando te asignen uno, aparecerá aquí.", a(e, "class", "hero-label svelte-ykyv02"), a(i, "class", "hero-paso svelte-ykyv02"), a(s, "class", "hero-trabajo svelte-ykyv02");
    },
    m(f, y) {
      m(f, e, y), le(t, e, null), u(e, n), m(f, r, y), m(f, i, y), m(f, o, y), m(f, s, y), c = !0;
    },
    p: K,
    i(f) {
      c || (L(t.$$.fragment, f), c = !0);
    },
    o(f) {
      A(t.$$.fragment, f), c = !1;
    },
    d(f) {
      f && (_(e), _(r), _(i), _(o), _(s)), ne(t);
    }
  };
}
function Qn(l) {
  let e, t, n, r, i, o, s, c, f, y, g, k, d, v;
  t = new se({ props: { name: "flag", size: 16 } });
  const M = [Xn, Zn], E = [];
  function z(h, N) {
    return (
      /*accion*/
      h[91].paso.status === "PENDING" ? 0 : 1
    );
  }
  y = z(l), g = E[y] = M[y](l);
  function O() {
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
      var h;
      e = p("p"), oe(t.$$.fragment), n = D(" Lo siguiente que tienes que hacer"), r = T(), i = p("p"), i.textContent = `${/*accion*/
      l[91].paso.name}`, o = T(), s = p("p"), s.textContent = `del trabajo «${/*accion*/
      l[91].order.description || "sin nombre"}» para ${/*accion*/
      (h = l[91].order.client) == null ? void 0 : h.name}`, c = T(), f = p("button"), g.c(), a(e, "class", "hero-label svelte-ykyv02"), a(i, "class", "hero-paso svelte-ykyv02"), a(s, "class", "hero-trabajo svelte-ykyv02"), a(f, "class", "btn hero-btn svelte-ykyv02"), ie(
        f,
        "naranja",
        /*accion*/
        l[91].paso.status === "PENDING"
      ), ie(
        f,
        "verde",
        /*accion*/
        l[91].paso.status === "IN_PROGRESS"
      );
    },
    m(h, N) {
      m(h, e, N), le(t, e, null), u(e, n), m(h, r, N), m(h, i, N), m(h, o, N), m(h, s, N), m(h, c, N), m(h, f, N), E[y].m(f, null), k = !0, d || (v = X(f, "click", O), d = !0);
    },
    p(h, N) {
      l = h;
    },
    i(h) {
      k || (L(t.$$.fragment, h), L(g), k = !0);
    },
    o(h) {
      A(t.$$.fragment, h), A(g), k = !1;
    },
    d(h) {
      h && (_(e), _(r), _(i), _(o), _(s), _(c), _(f)), ne(t), E[y].d(), d = !1, v();
    }
  };
}
function Zn(l) {
  let e, t, n;
  return e = new se({ props: { name: "check", size: 20 } }), {
    c() {
      oe(e.$$.fragment), t = D(" Ya lo terminé");
    },
    m(r, i) {
      le(e, r, i), m(r, t, i), n = !0;
    },
    i(r) {
      n || (L(e.$$.fragment, r), n = !0);
    },
    o(r) {
      A(e.$$.fragment, r), n = !1;
    },
    d(r) {
      r && _(t), ne(e, r);
    }
  };
}
function Xn(l) {
  let e, t, n;
  return e = new se({ props: { name: "play", size: 20 } }), {
    c() {
      oe(e.$$.fragment), t = D(" Empezar ahora");
    },
    m(r, i) {
      le(e, r, i), m(r, t, i), n = !0;
    },
    i(r) {
      n || (L(e.$$.fragment, r), n = !0);
    },
    o(r) {
      A(e.$$.fragment, r), n = !1;
    },
    d(r) {
      r && _(t), ne(e, r);
    }
  };
}
function xn(l) {
  let e, t = (
    /*pendientesN*/
    l[93] + ""
  ), n, r, i = (
    /*pendientesN*/
    l[93] === 1 ? "" : "s"
  ), o, s;
  return {
    c() {
      e = D("· "), n = D(t), r = D(" paso"), o = D(i), s = D(" por hacer");
    },
    m(c, f) {
      m(c, e, f), m(c, n, f), m(c, r, f), m(c, o, f), m(c, s, f);
    },
    p: K,
    d(c) {
      c && (_(e), _(n), _(r), _(o), _(s));
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
      e = D("· próxima entrega "), n = D(t);
    },
    m(r, i) {
      m(r, e, i), m(r, n, i);
    },
    p: K,
    d(r) {
      r && (_(e), _(n));
    }
  };
}
function tr(l) {
  let e = [], t = /* @__PURE__ */ new Map(), n, r, i = de(
    /*orders*/
    l[12]
  );
  const o = (s) => (
    /*o*/
    s[95].id
  );
  for (let s = 0; s < i.length; s += 1) {
    let c = Pt(l, i, s), f = o(c);
    t.set(f, e[s] = Kt(f, c));
  }
  return {
    c() {
      for (let s = 0; s < e.length; s += 1)
        e[s].c();
      n = Oe();
    },
    m(s, c) {
      for (let f = 0; f < e.length; f += 1)
        e[f] && e[f].m(s, c);
      m(s, n, c), r = !0;
    },
    p(s, c) {
      c[0] & /*orders, WOOD, FURNITURE*/
      805310464 | c[1] & /*pedirConfirmacionPaso*/
      256 && (i = de(
        /*orders*/
        s[12]
      ), ce(), e = dt(e, c, o, 1, s, i, t, n.parentNode, gt, Kt, n, Pt), ue());
    },
    i(s) {
      if (!r) {
        for (let c = 0; c < i.length; c += 1)
          L(e[c]);
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
  let e, t, n, r, i = (
    /*urg*/
    l[102].texto + ""
  ), o, s, c;
  const f = [rr, nr], y = [];
  function g(k, d) {
    return (
      /*urg*/
      k[102].nivel === "rojo" ? 0 : 1
    );
  }
  return t = g(l), n = y[t] = f[t](l), {
    c() {
      e = p("span"), n.c(), r = T(), o = D(i), a(e, "class", s = "urgencia " + /*urg*/
      l[102].nivel + " svelte-ykyv02");
    },
    m(k, d) {
      m(k, e, d), y[t].m(e, null), u(e, r), u(e, o), c = !0;
    },
    p(k, d) {
      let v = t;
      t = g(k), t !== v && (ce(), A(y[v], 1, 1, () => {
        y[v] = null;
      }), ue(), n = y[t], n || (n = y[t] = f[t](k), n.c()), L(n, 1), n.m(e, r)), (!c || d[0] & /*orders*/
      4096) && i !== (i = /*urg*/
      k[102].texto + "") && te(o, i), (!c || d[0] & /*orders*/
      4096 && s !== (s = "urgencia " + /*urg*/
      k[102].nivel + " svelte-ykyv02")) && a(e, "class", s);
    },
    i(k) {
      c || (L(n), c = !0);
    },
    o(k) {
      A(n), c = !1;
    },
    d(k) {
      k && _(e), y[t].d();
    }
  };
}
function nr(l) {
  let e, t;
  return e = new se({ props: { name: "clock", size: 14 } }), {
    c() {
      oe(e.$$.fragment);
    },
    m(n, r) {
      le(e, n, r), t = !0;
    },
    i(n) {
      t || (L(e.$$.fragment, n), t = !0);
    },
    o(n) {
      A(e.$$.fragment, n), t = !1;
    },
    d(n) {
      ne(e, n);
    }
  };
}
function rr(l) {
  let e, t;
  return e = new se({ props: { name: "alert", size: 14 } }), {
    c() {
      oe(e.$$.fragment);
    },
    m(n, r) {
      le(e, n, r), t = !0;
    },
    i(n) {
      t || (L(e.$$.fragment, n), t = !0);
    },
    o(n) {
      A(e.$$.fragment, n), t = !1;
    },
    d(n) {
      ne(e, n);
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
    m(r, i) {
      m(r, e, i);
      for (let o = 0; o < n.length; o += 1)
        n[o] && n[o].m(e, null);
    },
    p(r, i) {
      if (i[0] & /*WOOD, orders, FURNITURE*/
      805310464) {
        t = de(
          /*o*/
          r[95].items
        );
        let o;
        for (o = 0; o < t.length; o += 1) {
          const s = zt(r, t, o);
          n[o] ? n[o].p(s, i) : (n[o] = Ut(s), n[o].c(), n[o].m(e, null));
        }
        for (; o < n.length; o += 1)
          n[o].d(1);
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
      e = p("span"), t = D("· madera "), r = D(n), a(e, "class", "madera svelte-ykyv02");
    },
    m(i, o) {
      m(i, e, o), u(e, t), u(e, r);
    },
    p(i, o) {
      o[0] & /*orders*/
      4096 && n !== (n = /*WOOD*/
      (i[28][
        /*it*/
        i[107].woodType
      ] ?? /*it*/
      i[107].woodType) + "") && te(r, n);
    },
    d(i) {
      i && _(e);
    }
  };
}
function Ut(l) {
  let e, t, n = (
    /*it*/
    l[107].quantity + ""
  ), r, i, o, s = (
    /*it*/
    (l[107].description || /*FURNITURE*/
    l[29][
      /*it*/
      l[107].furnitureType
    ] || "pieza") + ""
  ), c, f, y, g = (
    /*it*/
    l[107].woodType && Gt(l)
  );
  return {
    c() {
      e = p("li"), t = p("b"), r = D(n), i = D("×"), o = T(), c = D(s), f = T(), g && g.c(), y = T(), a(e, "class", "svelte-ykyv02");
    },
    m(k, d) {
      m(k, e, d), u(e, t), u(t, r), u(t, i), u(e, o), u(e, c), u(e, f), g && g.m(e, null), u(e, y);
    },
    p(k, d) {
      d[0] & /*orders*/
      4096 && n !== (n = /*it*/
      k[107].quantity + "") && te(r, n), d[0] & /*orders*/
      4096 && s !== (s = /*it*/
      (k[107].description || /*FURNITURE*/
      k[29][
        /*it*/
        k[107].furnitureType
      ] || "pieza") + "") && te(c, s), /*it*/
      k[107].woodType ? g ? g.p(k, d) : (g = Gt(k), g.c(), g.m(e, y)) : g && (g.d(1), g = null);
    },
    d(k) {
      k && _(e), g && g.d();
    }
  };
}
function Vt(l) {
  let e, t, n, r, i = ft(Fe(
    /*o*/
    l[95]
  )) + "", o, s;
  return t = new se({ props: { name: "calendar", size: 15 } }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = D(" Entregar el "), r = p("b"), o = D(i), a(e, "class", "fecha svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), le(t, e, null), u(e, n), u(e, r), u(r, o), s = !0;
    },
    p(c, f) {
      (!s || f[0] & /*orders*/
      4096) && i !== (i = ft(Fe(
        /*o*/
        c[95]
      )) + "") && te(o, i);
    },
    i(c) {
      s || (L(t.$$.fragment, c), s = !0);
    },
    o(c) {
      A(t.$$.fragment, c), s = !1;
    },
    d(c) {
      c && _(e), ne(t);
    }
  };
}
function ir(l) {
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
function or(l) {
  let e, t, n, r, i, o = bt(
    /*o*/
    l[95]
  ) + "", s, c, f = (
    /*pasos*/
    l[100].length + ""
  ), y, g, k, d, v = [], M = /* @__PURE__ */ new Map(), E, z, O, h = de(
    /*pasos*/
    l[100]
  );
  const N = (I) => (
    /*p*/
    I[88].id
  );
  for (let I = 0; I < h.length; I += 1) {
    let b = Rt(l, h, I), w = N(b);
    M.set(w, v[I] = Yt(w, b));
  }
  let S = !/*sig*/
  l[101] && Jt();
  return {
    c() {
      e = p("div"), t = p("div"), n = p("div"), r = T(), i = p("p"), s = D(o), c = D(" de "), y = D(f), g = D(" pasos listos"), k = T(), d = p("ol");
      for (let I = 0; I < v.length; I += 1)
        v[I].c();
      E = T(), S && S.c(), z = Oe(), a(n, "class", "relleno svelte-ykyv02"), ke(n, "width", ul(
        /*o*/
        l[95]
      ) + "%"), a(t, "class", "barra svelte-ykyv02"), a(i, "class", "svelte-ykyv02"), a(e, "class", "progreso svelte-ykyv02"), a(d, "class", "pasos svelte-ykyv02");
    },
    m(I, b) {
      m(I, e, b), u(e, t), u(t, n), u(e, r), u(e, i), u(i, s), u(i, c), u(i, y), u(i, g), m(I, k, b), m(I, d, b);
      for (let w = 0; w < v.length; w += 1)
        v[w] && v[w].m(d, null);
      m(I, E, b), S && S.m(I, b), m(I, z, b), O = !0;
    },
    p(I, b) {
      (!O || b[0] & /*orders*/
      4096) && ke(n, "width", ul(
        /*o*/
        I[95]
      ) + "%"), (!O || b[0] & /*orders*/
      4096) && o !== (o = bt(
        /*o*/
        I[95]
      ) + "") && te(s, o), (!O || b[0] & /*orders*/
      4096) && f !== (f = /*pasos*/
      I[100].length + "") && te(y, f), b[0] & /*orders*/
      4096 | b[1] & /*pedirConfirmacionPaso*/
      256 && (h = de(
        /*pasos*/
        I[100]
      ), ce(), v = dt(v, b, N, 1, I, h, M, d, gt, Yt, null, Rt), ue()), /*sig*/
      I[101] ? S && (ce(), A(S, 1, 1, () => {
        S = null;
      }), ue()) : S ? b[0] & /*orders*/
      4096 && L(S, 1) : (S = Jt(), S.c(), L(S, 1), S.m(z.parentNode, z));
    },
    i(I) {
      if (!O) {
        for (let b = 0; b < h.length; b += 1)
          L(v[b]);
        L(S), O = !0;
      }
    },
    o(I) {
      for (let b = 0; b < v.length; b += 1)
        A(v[b]);
      A(S), O = !1;
    },
    d(I) {
      I && (_(e), _(k), _(d), _(E), _(z));
      for (let b = 0; b < v.length; b += 1)
        v[b].d();
      S && S.d(I);
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
      t = D(e);
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
      oe(e.$$.fragment);
    },
    m(n, r) {
      le(e, n, r), t = !0;
    },
    p: K,
    i(n) {
      t || (L(e.$$.fragment, n), t = !0);
    },
    o(n) {
      A(e.$$.fragment, n), t = !1;
    },
    d(n) {
      ne(e, n);
    }
  };
}
function Wt(l) {
  let e, t, n, r;
  const i = [ur, cr], o = [];
  function s(c, f) {
    return (
      /*p*/
      c[88].status === "PENDING" ? 0 : 1
    );
  }
  return e = s(l), t = o[e] = i[e](l), {
    c() {
      t.c(), n = Oe();
    },
    m(c, f) {
      o[e].m(c, f), m(c, n, f), r = !0;
    },
    p(c, f) {
      let y = e;
      e = s(c), e === y ? o[e].p(c, f) : (ce(), A(o[y], 1, 1, () => {
        o[y] = null;
      }), ue(), t = o[e], t ? t.p(c, f) : (t = o[e] = i[e](c), t.c()), L(t, 1), t.m(n.parentNode, n));
    },
    i(c) {
      r || (L(t), r = !0);
    },
    o(c) {
      A(t), r = !1;
    },
    d(c) {
      c && _(n), o[e].d(c);
    }
  };
}
function cr(l) {
  let e, t, n, r, i, o;
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
      e = p("button"), oe(t.$$.fragment), n = D(" Ya terminé"), a(e, "class", "btn verde svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), le(t, e, null), u(e, n), r = !0, i || (o = X(e, "click", s), i = !0);
    },
    p(c, f) {
      l = c;
    },
    i(c) {
      r || (L(t.$$.fragment, c), r = !0);
    },
    o(c) {
      A(t.$$.fragment, c), r = !1;
    },
    d(c) {
      c && _(e), ne(t), i = !1, o();
    }
  };
}
function ur(l) {
  let e, t, n, r, i, o;
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
      e = p("button"), oe(t.$$.fragment), n = D(" Empezar"), a(e, "class", "btn naranja svelte-ykyv02");
    },
    m(c, f) {
      m(c, e, f), le(t, e, null), u(e, n), r = !0, i || (o = X(e, "click", s), i = !0);
    },
    p(c, f) {
      l = c;
    },
    i(c) {
      r || (L(t.$$.fragment, c), r = !0);
    },
    o(c) {
      A(t.$$.fragment, c), r = !1;
    },
    d(c) {
      c && _(e), ne(t), i = !1, o();
    }
  };
}
function Yt(l, e) {
  var z;
  let t, n, r, i, o, s, c = (
    /*p*/
    e[88].name + ""
  ), f, y, g, k;
  const d = [ar, sr], v = [];
  function M(O, h) {
    return (
      /*p*/
      O[88].status === "COMPLETED" ? 0 : 1
    );
  }
  r = M(e), i = v[r] = d[r](e);
  let E = (
    /*p*/
    e[88].id === /*sig*/
    ((z = e[101]) == null ? void 0 : z.id) && Wt(e)
  );
  return {
    key: l,
    first: null,
    c() {
      t = p("li"), n = p("span"), i.c(), o = T(), s = p("span"), f = D(c), y = T(), E && E.c(), g = T(), a(n, "class", "num svelte-ykyv02"), ie(
        n,
        "num-ok",
        /*p*/
        e[88].status === "COMPLETED"
      ), ie(
        n,
        "num-curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      ), a(s, "class", "pname svelte-ykyv02"), a(t, "class", "svelte-ykyv02"), ie(
        t,
        "hecho",
        /*p*/
        e[88].status === "COMPLETED"
      ), ie(
        t,
        "curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      ), this.first = t;
    },
    m(O, h) {
      m(O, t, h), u(t, n), v[r].m(n, null), u(t, o), u(t, s), u(s, f), u(t, y), E && E.m(t, null), u(t, g), k = !0;
    },
    p(O, h) {
      var S;
      e = O;
      let N = r;
      r = M(e), r === N ? v[r].p(e, h) : (ce(), A(v[N], 1, 1, () => {
        v[N] = null;
      }), ue(), i = v[r], i ? i.p(e, h) : (i = v[r] = d[r](e), i.c()), L(i, 1), i.m(n, null)), (!k || h[0] & /*orders*/
      4096) && ie(
        n,
        "num-ok",
        /*p*/
        e[88].status === "COMPLETED"
      ), (!k || h[0] & /*orders*/
      4096) && ie(
        n,
        "num-curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      ), (!k || h[0] & /*orders*/
      4096) && c !== (c = /*p*/
      e[88].name + "") && te(f, c), /*p*/
      e[88].id === /*sig*/
      ((S = e[101]) == null ? void 0 : S.id) ? E ? (E.p(e, h), h[0] & /*orders*/
      4096 && L(E, 1)) : (E = Wt(e), E.c(), L(E, 1), E.m(t, g)) : E && (ce(), A(E, 1, 1, () => {
        E = null;
      }), ue()), (!k || h[0] & /*orders*/
      4096) && ie(
        t,
        "hecho",
        /*p*/
        e[88].status === "COMPLETED"
      ), (!k || h[0] & /*orders*/
      4096) && ie(
        t,
        "curso",
        /*p*/
        e[88].status === "IN_PROGRESS"
      );
    },
    i(O) {
      k || (L(i), L(E), k = !0);
    },
    o(O) {
      A(i), A(E), k = !1;
    },
    d(O) {
      O && _(t), v[r].d(), E && E.d();
    }
  };
}
function Jt(l) {
  let e, t, n, r;
  return t = new se({
    props: { name: "check-circle", size: 18 }
  }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = D(" ¡Trabajo terminado! Avisa al encargado."), a(e, "class", "terminado svelte-ykyv02");
    },
    m(i, o) {
      m(i, e, o), le(t, e, null), u(e, n), r = !0;
    },
    i(i) {
      r || (L(t.$$.fragment, i), r = !0);
    },
    o(i) {
      A(t.$$.fragment, i), r = !1;
    },
    d(i) {
      i && _(e), ne(t);
    }
  };
}
function Kt(l, e) {
  var Z, U;
  let t, n, r, i = (
    /*o*/
    (e[95].description || "Trabajo sin nombre") + ""
  ), o, s, c, f, y, g, k, d = (
    /*o*/
    (((Z = e[95].client) == null ? void 0 : Z.name) ?? "—") + ""
  ), v, M, E, z = Fe(
    /*o*/
    e[95]
  ), O, h, N, S, I, b = (
    /*urg*/
    e[102] && Bt(e)
  );
  y = new se({ props: { name: "user", size: 14 } });
  let w = (
    /*o*/
    ((U = e[95].items) == null ? void 0 : U.length) && Ht(e)
  ), C = z && Vt(e);
  const W = [or, ir], Y = [];
  function F(H, $) {
    return (
      /*pasos*/
      H[100].length ? 0 : 1
    );
  }
  return h = F(e), N = Y[h] = W[h](e), {
    key: l,
    first: null,
    c() {
      t = p("section"), n = p("div"), r = p("h2"), o = D(i), s = T(), b && b.c(), c = T(), f = p("p"), oe(y.$$.fragment), g = D(" Para: "), k = p("b"), v = D(d), M = T(), w && w.c(), E = T(), C && C.c(), O = T(), N.c(), S = T(), a(r, "class", "svelte-ykyv02"), a(n, "class", "trabajo-top svelte-ykyv02"), a(f, "class", "para svelte-ykyv02"), a(t, "class", "card trabajo svelte-ykyv02"), ie(t, "terminado-card", fl(
        /*o*/
        e[95]
      )), this.first = t;
    },
    m(H, $) {
      m(H, t, $), u(t, n), u(n, r), u(r, o), u(n, s), b && b.m(n, null), u(t, c), u(t, f), le(y, f, null), u(f, g), u(f, k), u(k, v), u(t, M), w && w.m(t, null), u(t, E), C && C.m(t, null), u(t, O), Y[h].m(t, null), u(t, S), I = !0;
    },
    p(H, $) {
      var R, j;
      e = H, (!I || $[0] & /*orders*/
      4096) && i !== (i = /*o*/
      (e[95].description || "Trabajo sin nombre") + "") && te(o, i), /*urg*/
      e[102] ? b ? (b.p(e, $), $[0] & /*orders*/
      4096 && L(b, 1)) : (b = Bt(e), b.c(), L(b, 1), b.m(n, null)) : b && (ce(), A(b, 1, 1, () => {
        b = null;
      }), ue()), (!I || $[0] & /*orders*/
      4096) && d !== (d = /*o*/
      (((R = e[95].client) == null ? void 0 : R.name) ?? "—") + "") && te(v, d), /*o*/
      (j = e[95].items) != null && j.length ? w ? w.p(e, $) : (w = Ht(e), w.c(), w.m(t, E)) : w && (w.d(1), w = null), $[0] & /*orders*/
      4096 && (z = Fe(
        /*o*/
        e[95]
      )), z ? C ? (C.p(e, $), $[0] & /*orders*/
      4096 && L(C, 1)) : (C = Vt(e), C.c(), L(C, 1), C.m(t, O)) : C && (ce(), A(C, 1, 1, () => {
        C = null;
      }), ue());
      let V = h;
      h = F(e), h === V ? Y[h].p(e, $) : (ce(), A(Y[V], 1, 1, () => {
        Y[V] = null;
      }), ue(), N = Y[h], N ? N.p(e, $) : (N = Y[h] = W[h](e), N.c()), L(N, 1), N.m(t, S)), (!I || $[0] & /*orders*/
      4096) && ie(t, "terminado-card", fl(
        /*o*/
        e[95]
      ));
    },
    i(H) {
      I || (L(b), L(y.$$.fragment, H), L(C), L(N), I = !0);
    },
    o(H) {
      A(b), A(y.$$.fragment, H), A(C), A(N), I = !1;
    },
    d(H) {
      H && _(t), b && b.d(), ne(y), w && w.d(), C && C.d(), Y[h].d();
    }
  };
}
function fr(l) {
  let e = [], t = /* @__PURE__ */ new Map(), n, r, i = de(
    /*proximas*/
    l[94]
  );
  const o = (s) => (
    /*o*/
    s[95].id
  );
  for (let s = 0; s < i.length; s += 1) {
    let c = At(l, i, s), f = o(c);
    t.set(f, e[s] = Qt(f, c));
  }
  return {
    c() {
      for (let s = 0; s < e.length; s += 1)
        e[s].c();
      n = Oe();
    },
    m(s, c) {
      for (let f = 0; f < e.length; f += 1)
        e[f] && e[f].m(s, c);
      m(s, n, c), r = !0;
    },
    p(s, c) {
      c[0] & /*SLOT*/
      1073741824 | c[1] & /*DELIVERY_STATUS, entregasProximas*/
      33 && (i = de(
        /*proximas*/
        s[94]
      ), ce(), e = dt(e, c, o, 1, s, i, t, n.parentNode, gt, Qt, n, At), ue());
    },
    i(s) {
      if (!r) {
        for (let c = 0; c < i.length; c += 1)
          L(e[c]);
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
      )}`, a(e, "class", "urgencia svelte-ykyv02"), ie(
        e,
        "rojo",
        /*o*/
        l[95].d <= 1
      ), ie(
        e,
        "ambar",
        /*o*/
        l[95].d > 1 && /*o*/
        l[95].d <= 3
      ), ie(
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
    l[95].deliveryAddress) && yr(l)
  ), i = (
    /*lat*/
    l[98] && /*lng*/
    l[99] && hr(l)
  );
  return {
    c() {
      r && r.c(), e = T(), i && i.c(), t = Oe();
    },
    m(o, s) {
      r && r.m(o, s), m(o, e, s), i && i.m(o, s), m(o, t, s), n = !0;
    },
    p(o, s) {
      /*o*/
      (o[95].delivery.address ?? /*o*/
      o[95].deliveryAddress) && r.p(o, s), /*lat*/
      o[98] && /*lng*/
      o[99] && i.p(o, s);
    },
    i(o) {
      n || (L(r), L(i), n = !0);
    },
    o(o) {
      A(r), A(i), n = !1;
    },
    d(o) {
      o && (_(e), _(t)), r && r.d(o), i && i.d(o);
    }
  };
}
function mr(l) {
  let e, t, n, r, i, o;
  return t = new se({ props: { name: "store", size: 14 } }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = T(), r = p("b"), r.textContent = "El cliente recoge en el taller", i = D(" — no hay que llevar nada."), a(e, "class", "dir svelte-ykyv02");
    },
    m(s, c) {
      m(s, e, c), le(t, e, null), u(e, n), u(e, r), u(e, i), o = !0;
    },
    p: K,
    i(s) {
      o || (L(t.$$.fragment, s), o = !0);
    },
    o(s) {
      A(t.$$.fragment, s), o = !1;
    },
    d(s) {
      s && _(e), ne(t);
    }
  };
}
function yr(l) {
  let e, t, n, r = (
    /*o*/
    (l[95].delivery.address ?? /*o*/
    l[95].deliveryAddress) + ""
  ), i, o;
  return t = new se({ props: { name: "pin", size: 14 } }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = T(), i = D(r), a(e, "class", "dir svelte-ykyv02");
    },
    m(s, c) {
      m(s, e, c), le(t, e, null), u(e, n), u(e, i), o = !0;
    },
    p: K,
    i(s) {
      o || (L(t.$$.fragment, s), o = !0);
    },
    o(s) {
      A(t.$$.fragment, s), o = !1;
    },
    d(s) {
      s && _(e), ne(t);
    }
  };
}
function hr(l) {
  let e, t, n, r;
  return t = new se({ props: { name: "navigation", size: 16 } }), {
    c() {
      e = p("a"), oe(t.$$.fragment), n = D(" Abrir ubicación en Maps"), a(e, "class", "maps-btn svelte-ykyv02"), a(e, "target", "_blank"), a(e, "rel", "noopener"), a(e, "href", "https://www.google.com/maps?q=" + /*lat*/
      l[98] + "," + /*lng*/
      l[99]);
    },
    m(i, o) {
      m(i, e, o), le(t, e, null), u(e, n), r = !0;
    },
    p: K,
    i(i) {
      r || (L(t.$$.fragment, i), r = !0);
    },
    o(i) {
      A(t.$$.fragment, i), r = !1;
    },
    d(i) {
      i && _(e), ne(t);
    }
  };
}
function Qt(l, e) {
  var H;
  let t, n, r, i, o, s, c, f = (
    /*SLOT*/
    (e[30][
      /*o*/
      e[95].delivery.timeSlot
    ] ?? "") + ""
  ), y, g, k, d, v, M, E, z = (
    /*o*/
    (((H = e[95].client) == null ? void 0 : H.name) ?? "el cliente") + ""
  ), O, h, N, S, I, b, w, C;
  i = new se({ props: { name: "calendar", size: 17 } });
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
  return N = Z(e), S = F[N] = Y[N](U(e, N)), {
    key: l,
    first: null,
    c() {
      t = p("section"), n = p("div"), r = p("p"), oe(i.$$.fragment), o = T(), s = p("b"), s.textContent = `${ft(
        /*o*/
        e[95].delivery.scheduledDate
      )}`, c = D(" — "), y = D(f), g = T(), W && W.c(), k = T(), d = p("p"), v = D("Llevar: "), M = p("b"), M.textContent = `${/*o*/
      e[95].description || "pedido"}`, E = D(" de "), O = D(z), h = T(), S.c(), I = T(), b = p("span"), b.textContent = `${/*DELIVERY_STATUS*/
      e[31][
        /*o*/
        e[95].delivery.status
      ] ?? /*o*/
      e[95].delivery.status}`, w = T(), a(r, "class", "edia svelte-ykyv02"), a(n, "class", "entrega-top svelte-ykyv02"), a(d, "class", "svelte-ykyv02"), a(b, "class", "badge svelte-ykyv02"), a(t, "class", "card entrega svelte-ykyv02"), this.first = t;
    },
    m($, V) {
      m($, t, V), u(t, n), u(n, r), le(i, r, null), u(r, o), u(r, s), u(r, c), u(r, y), u(n, g), W && W.m(n, null), u(t, k), u(t, d), u(d, v), u(d, M), u(d, E), u(d, O), u(t, h), F[N].m(t, null), u(t, I), u(t, b), u(t, w), C = !0;
    },
    p($, V) {
      e = $, /*o*/
      e[95].d !== null && W.p(e, V), S.p(U(e, N), V);
    },
    i($) {
      C || (L(i.$$.fragment, $), L(S), C = !0);
    },
    o($) {
      A(i.$$.fragment, $), A(S), C = !1;
    },
    d($) {
      $ && _(t), ne(i), W && W.d(), F[N].d();
    }
  };
}
function Zt(l) {
  let e, t, n, r, i;
  return t = new se({
    props: { name: "check-circle", size: 20 }
  }), {
    c() {
      e = p("p"), oe(t.$$.fragment), n = T(), r = D(
        /*aviso*/
        l[13]
      ), a(e, "class", "aviso svelte-ykyv02");
    },
    m(o, s) {
      m(o, e, s), le(t, e, null), u(e, n), u(e, r), i = !0;
    },
    p(o, s) {
      (!i || s[0] & /*aviso*/
      8192) && te(
        r,
        /*aviso*/
        o[13]
      );
    },
    i(o) {
      i || (L(t.$$.fragment, o), i = !0);
    },
    o(o) {
      A(t.$$.fragment, o), i = !1;
    },
    d(o) {
      o && _(e), ne(t);
    }
  };
}
function vr(l) {
  let e, t = [], n = /* @__PURE__ */ new Map(), r = de(
    /*productos*/
    l[1]
  );
  const i = (o) => (
    /*p*/
    o[88].id
  );
  for (let o = 0; o < r.length; o += 1) {
    let s = jt(l, r, o), c = i(s);
    n.set(c, t[o] = el(c, s));
  }
  return {
    c() {
      e = p("div");
      for (let o = 0; o < t.length; o += 1)
        t[o].c();
      a(e, "class", "mk-grid svelte-ykyv02");
    },
    m(o, s) {
      m(o, e, s);
      for (let c = 0; c < t.length; c += 1)
        t[c] && t[c].m(e, null);
    },
    p(o, s) {
      s[0] & /*pedirEliminar, productos, abrirEditar*/
      167772162 && (r = de(
        /*productos*/
        o[1]
      ), t = dt(t, s, i, 1, o, r, n, e, Ql, el, null, jt));
    },
    d(o) {
      o && _(e);
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
    m(r, i) {
      m(r, e, i);
    },
    p(r, i) {
      i[0] & /*productos*/
      2 && !Nt(e.src, t = /*p*/
      r[88].imageUrl) && a(e, "src", t), i[0] & /*productos*/
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
      e = p("p"), t = D("Publicado por "), r = D(n), a(e, "class", "gris-texto svelte-ykyv02");
    },
    m(i, o) {
      m(i, e, o), u(e, t), u(e, r);
    },
    p(i, o) {
      o[0] & /*productos*/
      2 && n !== (n = /*p*/
      i[88].carpenterName + "") && te(r, n);
    },
    d(i) {
      i && _(e);
    }
  };
}
function el(l, e) {
  let t, n, r, i = (
    /*p*/
    e[88].name + ""
  ), o, s, c, f = (
    /*p*/
    e[88].category + ""
  ), y, g, k = (
    /*p*/
    e[88].woodType + ""
  ), d, v, M = (
    /*p*/
    e[88].dimensions + ""
  ), E, z, O, h, N = (
    /*p*/
    e[88].price + ""
  ), S, I, b, w = (
    /*p*/
    e[88].stock > 0 ? `${/*p*/
    e[88].stock} disponibles` : "Agotado"
  ), C, W, Y, F, Z, U, H, $, V, R, j = (
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
      t = p("section"), j && j.c(), n = T(), r = p("h2"), o = D(i), s = T(), c = p("p"), y = D(f), g = D(" · madera "), d = D(k), v = D(" · "), E = D(M), z = T(), O = p("p"), h = D("Bs "), S = D(N), I = T(), b = p("span"), C = D(w), W = T(), x && x.c(), Y = T(), F = p("div"), Z = p("button"), Z.textContent = "Editar / Stock", U = T(), H = p("button"), H.textContent = "Eliminar", $ = T(), a(r, "class", "svelte-ykyv02"), a(c, "class", "gris-texto svelte-ykyv02"), a(b, "class", "urgencia svelte-ykyv02"), ie(
        b,
        "ok",
        /*p*/
        e[88].stock > 0
      ), ie(
        b,
        "rojo",
        /*p*/
        e[88].stock <= 0
      ), a(O, "class", "mk-precio svelte-ykyv02"), a(Z, "class", "btn svelte-ykyv02"), a(H, "class", "btn gris svelte-ykyv02"), a(F, "class", "modal-btns svelte-ykyv02"), a(t, "class", "card mk-card svelte-ykyv02"), this.first = t;
    },
    m(fe, Q) {
      m(fe, t, Q), j && j.m(t, null), u(t, n), u(t, r), u(r, o), u(t, s), u(t, c), u(c, y), u(c, g), u(c, d), u(c, v), u(c, E), u(t, z), u(t, O), u(O, h), u(O, S), u(O, I), u(O, b), u(b, C), u(t, W), x && x.m(t, null), u(t, Y), u(t, F), u(F, Z), u(F, U), u(F, H), u(t, $), V || (R = [
        X(Z, "click", be),
        X(H, "click", Ee)
      ], V = !0);
    },
    p(fe, Q) {
      e = fe, /*p*/
      e[88].imageUrl ? j ? j.p(e, Q) : (j = Xt(e), j.c(), j.m(t, n)) : j && (j.d(1), j = null), Q[0] & /*productos*/
      2 && i !== (i = /*p*/
      e[88].name + "") && te(o, i), Q[0] & /*productos*/
      2 && f !== (f = /*p*/
      e[88].category + "") && te(y, f), Q[0] & /*productos*/
      2 && k !== (k = /*p*/
      e[88].woodType + "") && te(d, k), Q[0] & /*productos*/
      2 && M !== (M = /*p*/
      e[88].dimensions + "") && te(E, M), Q[0] & /*productos*/
      2 && N !== (N = /*p*/
      e[88].price + "") && te(S, N), Q[0] & /*productos*/
      2 && w !== (w = /*p*/
      e[88].stock > 0 ? `${/*p*/
      e[88].stock} disponibles` : "Agotado") && te(C, w), Q[0] & /*productos*/
      2 && ie(
        b,
        "ok",
        /*p*/
        e[88].stock > 0
      ), Q[0] & /*productos*/
      2 && ie(
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
  const i = [gr, br], o = [];
  function s(c, f) {
    return (
      /*chatAbierto*/
      c[15] ? 1 : 0
    );
  }
  return e = s(l), t = o[e] = i[e](l), {
    c() {
      t.c(), n = Oe();
    },
    m(c, f) {
      o[e].m(c, f), m(c, n, f), r = !0;
    },
    p(c, f) {
      let y = e;
      e = s(c), e === y ? o[e].p(c, f) : (ce(), A(o[y], 1, 1, () => {
        o[y] = null;
      }), ue(), t = o[e], t ? t.p(c, f) : (t = o[e] = i[e](c), t.c()), L(t, 1), t.m(n.parentNode, n));
    },
    i(c) {
      r || (L(t), r = !0);
    },
    o(c) {
      A(t), r = !1;
    },
    d(c) {
      c && _(n), o[e].d(c);
    }
  };
}
function br(l) {
  let e, t, n, r, i, o, s, c, f, y, g, k, d, v, M, E, z, O, h, N, S, I = (
    /*agentLoading*/
    l[19] ? "…" : "Preguntar"
  ), b, w, C, W;
  s = new se({ props: { name: "chat", size: 18 } });
  let Y = de(
    /*PREGUNTAS*/
    l[33]
  ), F = [];
  for (let $ = 0; $ < Y.length; $ += 1)
    F[$] = ll(Ot(l, Y, $));
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
      e = p("div"), t = T(), n = p("aside"), r = p("div"), i = p("div"), o = p("span"), oe(s.$$.fragment), c = T(), f = p("div"), f.innerHTML = '<b>Asistente del taller</b><p class="panel-sub svelte-ykyv02">Pregúntame lo que necesites</p>', y = T(), g = p("button"), g.textContent = "✕", k = T(), d = p("div");
      for (let $ = 0; $ < F.length; $ += 1)
        F[$].c();
      v = T(), M = p("div");
      for (let $ = 0; $ < U.length; $ += 1)
        U[$].c();
      E = T(), H && H.c(), z = T(), O = p("div"), h = p("input"), N = T(), S = p("button"), b = D(I), a(e, "class", "chat-fondo svelte-ykyv02"), a(e, "role", "presentation"), a(o, "class", "panel-ico svelte-ykyv02"), a(i, "class", "panel-title svelte-ykyv02"), a(g, "class", "panel-cerrar svelte-ykyv02"), a(g, "aria-label", "Cerrar"), a(r, "class", "panel-top svelte-ykyv02"), a(d, "class", "chips svelte-ykyv02"), a(M, "class", "chat svelte-ykyv02"), a(h, "type", "text"), a(h, "placeholder", "Escribe tu duda aquí…"), a(h, "class", "svelte-ykyv02"), a(S, "class", "btn svelte-ykyv02"), S.disabled = /*agentLoading*/
      l[19], a(O, "class", "row panel-input svelte-ykyv02"), a(n, "class", "panel svelte-ykyv02"), a(n, "role", "dialog"), a(n, "aria-label", "Asistente del taller");
    },
    m($, V) {
      m($, e, V), m($, t, V), m($, n, V), u(n, r), u(r, i), u(i, o), le(s, o, null), u(i, c), u(i, f), u(r, y), u(r, g), u(n, k), u(n, d);
      for (let R = 0; R < F.length; R += 1)
        F[R] && F[R].m(d, null);
      u(n, v), u(n, M);
      for (let R = 0; R < U.length; R += 1)
        U[R] && U[R].m(M, null);
      u(M, E), H && H.m(M, null), l[56](M), u(n, z), u(n, O), u(O, h), ve(
        h,
        /*agentQuery*/
        l[17]
      ), u(O, N), u(O, S), u(S, b), w = !0, C || (W = [
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
          h,
          "input",
          /*input_input_handler*/
          l[57]
        ),
        X(
          h,
          "keydown",
          /*keydown_handler*/
          l[58]
        ),
        X(
          S,
          "click",
          /*click_handler_13*/
          l[59]
        )
      ], C = !0);
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
          const j = Ot($, Y, R);
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
          U[R] ? U[R].p(j, V) : (U[R] = nl(j), U[R].c(), U[R].m(M, E));
        }
        for (; R < U.length; R += 1)
          U[R].d(1);
        U.length = Z.length;
      }
      /*agentLoading*/
      $[19] ? H || (H = rl(), H.c(), H.m(M, null)) : H && (H.d(1), H = null), V[0] & /*agentQuery*/
      131072 && h.value !== /*agentQuery*/
      $[17] && ve(
        h,
        /*agentQuery*/
        $[17]
      ), (!w || V[0] & /*agentLoading*/
      524288) && I !== (I = /*agentLoading*/
      $[19] ? "…" : "Preguntar") && te(b, I), (!w || V[0] & /*agentLoading*/
      524288) && (S.disabled = /*agentLoading*/
      $[19]);
    },
    i($) {
      w || (L(s.$$.fragment, $), w = !0);
    },
    o($) {
      A(s.$$.fragment, $), w = !1;
    },
    d($) {
      $ && (_(e), _(t), _(n)), ne(s), tt(F, $), tt(U, $), H && H.d(), l[56](null), C = !1, we(W);
    }
  };
}
function gr(l) {
  let e, t, n, r, i, o;
  return t = new se({ props: { name: "chat", size: 26 } }), {
    c() {
      e = p("button"), oe(t.$$.fragment), n = p("span"), n.textContent = "Ayuda", a(n, "class", "fab-label"), a(e, "class", "fab svelte-ykyv02"), a(e, "aria-label", "Asistente");
    },
    m(s, c) {
      m(s, e, c), le(t, e, null), u(e, n), r = !0, i || (o = X(
        e,
        "click",
        /*click_handler_9*/
        l[52]
      ), i = !0);
    },
    p: K,
    i(s) {
      r || (L(t.$$.fragment, s), r = !0);
    },
    o(s) {
      A(t.$$.fragment, s), r = !1;
    },
    d(s) {
      s && _(e), ne(t), i = !1, o();
    }
  };
}
function ll(l) {
  let e, t = (
    /*q*/
    l[85] + ""
  ), n, r, i;
  function o() {
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
      e = p("button"), n = D(t), a(e, "class", "chip svelte-ykyv02"), e.disabled = /*agentLoading*/
      l[19];
    },
    m(s, c) {
      m(s, e, c), u(e, n), r || (i = X(e, "click", o), r = !0);
    },
    p(s, c) {
      l = s, c[0] & /*agentLoading*/
      524288 && (e.disabled = /*agentLoading*/
      l[19]);
    },
    d(s) {
      s && _(e), r = !1, i();
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
      e = p("div"), n = D(t), a(e, "class", "bubble svelte-ykyv02"), ie(
        e,
        "bubble-user",
        /*m*/
        l[77].role === "user"
      ), ie(
        e,
        "bubble-agent",
        /*m*/
        l[77].role === "agent"
      );
    },
    m(r, i) {
      m(r, e, i), u(e, n);
    },
    p(r, i) {
      i[0] & /*agentMsgs*/
      262144 && t !== (t = /*m*/
      r[77].text + "") && te(n, t), i[0] & /*agentMsgs*/
      262144 && ie(
        e,
        "bubble-user",
        /*m*/
        r[77].role === "user"
      ), i[0] & /*agentMsgs*/
      262144 && ie(
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
function il(l) {
  let e, t, n, r, i = (
    /*prodEditando*/
    l[3] ? "Editar mueble" : "Publicar mueble"
  ), o, s, c, f, y, g, k, d, v, M, E, z, O, h, N, S, I, b, w, C, W, Y, F, Z, U, H, $, V, R, j, x, be, Ee, fe, Q, Ae, ye, Pe, De, $e, Re, G, re, Me, Se, He = (
    /*prodGuardando*/
    l[5] ? "Guardando…" : "Guardar"
  ), Qe, Ze, it, Le = de(
    /*CATEGORIAS*/
    l[21]
  ), _e = [];
  for (let q = 0; q < Le.length; q += 1)
    _e[q] = ol(Ct(l, Le, q));
  let Ce = de(
    /*MADERAS*/
    l[22]
  ), me = [];
  for (let q = 0; q < Ce.length; q += 1)
    me[q] = sl(Lt(l, Ce, q));
  let he = (
    /*prodError*/
    l[6] && al(l)
  );
  return {
    c() {
      e = p("div"), t = p("form"), n = p("p"), r = p("b"), o = D(i), s = T(), c = p("label"), f = D("Nombre"), y = p("input"), g = T(), k = p("div"), d = p("label"), v = D("Categoría"), M = p("select");
      for (let q = 0; q < _e.length; q += 1)
        _e[q].c();
      E = T(), z = p("label"), O = D("Madera"), h = p("select");
      for (let q = 0; q < me.length; q += 1)
        me[q].c();
      N = T(), S = p("label"), I = D("Medidas"), b = p("input"), w = T(), C = p("div"), W = p("label"), Y = D("Precio Bs"), F = p("input"), Z = T(), U = p("label"), H = D("Stock"), $ = p("input"), V = T(), R = p("label"), j = D("Días"), x = p("input"), be = T(), Ee = p("label"), fe = D("Descripción"), Q = p("textarea"), Ae = T(), ye = p("label"), Pe = D(`Foto (se sube al bucket S3)
        `), De = p("input"), $e = T(), he && he.c(), Re = T(), G = p("div"), re = p("button"), re.textContent = "Cancelar", Me = T(), Se = p("button"), Qe = D(He), a(n, "class", "big svelte-ykyv02"), y.required = !0, a(y, "class", "svelte-ykyv02"), a(c, "class", "svelte-ykyv02"), a(M, "class", "svelte-ykyv02"), /*prodForm*/
      l[7].category === void 0 && nt(() => (
        /*select0_change_handler*/
        l[61].call(M)
      )), a(d, "class", "svelte-ykyv02"), a(h, "class", "svelte-ykyv02"), /*prodForm*/
      l[7].woodType === void 0 && nt(() => (
        /*select1_change_handler*/
        l[62].call(h)
      )), a(z, "class", "svelte-ykyv02"), a(k, "class", "row svelte-ykyv02"), b.required = !0, a(b, "class", "svelte-ykyv02"), a(S, "class", "svelte-ykyv02"), a(F, "type", "number"), a(F, "min", "1"), F.required = !0, a(F, "class", "svelte-ykyv02"), a(W, "class", "svelte-ykyv02"), a($, "type", "number"), a($, "min", "0"), $.required = !0, a($, "class", "svelte-ykyv02"), a(U, "class", "svelte-ykyv02"), a(x, "type", "number"), a(x, "min", "1"), a(x, "class", "svelte-ykyv02"), a(R, "class", "svelte-ykyv02"), a(C, "class", "row svelte-ykyv02"), a(Q, "rows", "3"), Q.required = !0, a(Q, "class", "svelte-ykyv02"), a(Ee, "class", "svelte-ykyv02"), a(De, "type", "file"), a(De, "accept", "image/*"), a(De, "class", "svelte-ykyv02"), a(ye, "class", "svelte-ykyv02"), a(re, "type", "button"), a(re, "class", "btn gris svelte-ykyv02"), a(Se, "type", "submit"), a(Se, "class", "btn verde svelte-ykyv02"), Se.disabled = /*prodGuardando*/
      l[5], a(G, "class", "modal-btns svelte-ykyv02"), a(t, "class", "modal mk-form svelte-ykyv02"), a(e, "class", "fondo svelte-ykyv02"), a(e, "role", "presentation");
    },
    m(q, ae) {
      m(q, e, ae), u(e, t), u(t, n), u(n, r), u(r, o), u(t, s), u(t, c), u(c, f), u(c, y), ve(
        y,
        /*prodForm*/
        l[7].name
      ), u(t, g), u(t, k), u(k, d), u(d, v), u(d, M);
      for (let J = 0; J < _e.length; J += 1)
        _e[J] && _e[J].m(M, null);
      st(
        M,
        /*prodForm*/
        l[7].category,
        !0
      ), u(k, E), u(k, z), u(z, O), u(z, h);
      for (let J = 0; J < me.length; J += 1)
        me[J] && me[J].m(h, null);
      st(
        h,
        /*prodForm*/
        l[7].woodType,
        !0
      ), u(t, N), u(t, S), u(S, I), u(S, b), ve(
        b,
        /*prodForm*/
        l[7].dimensions
      ), u(t, w), u(t, C), u(C, W), u(W, Y), u(W, F), ve(
        F,
        /*prodForm*/
        l[7].price
      ), u(C, Z), u(C, U), u(U, H), u(U, $), ve(
        $,
        /*prodForm*/
        l[7].stock
      ), u(C, V), u(C, R), u(R, j), u(R, x), ve(
        x,
        /*prodForm*/
        l[7].estimatedDays
      ), u(t, be), u(t, Ee), u(Ee, fe), u(Ee, Q), ve(
        Q,
        /*prodForm*/
        l[7].description
      ), u(t, Ae), u(t, ye), u(ye, Pe), u(ye, De), u(t, $e), he && he.m(t, null), u(t, Re), u(t, G), u(G, re), u(G, Me), u(G, Se), u(Se, Qe), Ze || (it = [
        X(
          y,
          "input",
          /*input0_input_handler*/
          l[60]
        ),
        X(
          M,
          "change",
          /*select0_change_handler*/
          l[61]
        ),
        X(
          h,
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
          re,
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
      8 && i !== (i = /*prodEditando*/
      q[3] ? "Editar mueble" : "Publicar mueble") && te(o, i), ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && y.value !== /*prodForm*/
      q[7].name && ve(
        y,
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
          _e[J] ? _e[J].p(ze, ae) : (_e[J] = ol(ze), _e[J].c(), _e[J].m(M, null));
        }
        for (; J < _e.length; J += 1)
          _e[J].d(1);
        _e.length = Le.length;
      }
      if (ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && st(
        M,
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
          me[J] ? me[J].p(ze, ae) : (me[J] = sl(ze), me[J].c(), me[J].m(h, null));
        }
        for (; J < me.length; J += 1)
          me[J].d(1);
        me.length = Ce.length;
      }
      ae[0] & /*prodForm, CATEGORIAS*/
      2097280 && st(
        h,
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
      q[6] ? he ? he.p(q, ae) : (he = al(q), he.c(), he.m(t, Re)) : he && (he.d(1), he = null), ae[0] & /*prodGuardando*/
      32 && He !== (He = /*prodGuardando*/
      q[5] ? "Guardando…" : "Guardar") && te(Qe, He), ae[0] & /*prodGuardando*/
      32 && (Se.disabled = /*prodGuardando*/
      q[5]);
    },
    d(q) {
      q && _(e), tt(_e, q), tt(me, q), he && he.d(), Ze = !1, we(it);
    }
  };
}
function ol(l) {
  let e, t = (
    /*c*/
    l[80] + ""
  ), n;
  return {
    c() {
      e = p("option"), n = D(t), e.__value = /*c*/
      l[80], ve(e, e.__value);
    },
    m(r, i) {
      m(r, e, i), u(e, n);
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
      e = p("option"), n = D(t), e.__value = /*m*/
      l[77], ve(e, e.__value);
    },
    m(r, i) {
      m(r, e, i), u(e, n);
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
      e = p("p"), t = D(
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
  ), i, o, s, c, f, y, g, k, d, v, M;
  return g = new se({ props: { name: "check", size: 18 } }), {
    c() {
      e = p("div"), t = p("div"), n = p("p"), i = D(r), o = T(), s = p("div"), c = p("button"), c.textContent = "Todavía no", f = T(), y = p("button"), oe(g.$$.fragment), k = D(" Sí"), a(n, "class", "big center svelte-ykyv02"), a(c, "class", "btn gris svelte-ykyv02"), a(y, "class", "btn verde svelte-ykyv02"), a(s, "class", "modal-btns svelte-ykyv02"), a(t, "class", "modal svelte-ykyv02"), a(e, "class", "fondo svelte-ykyv02"), a(e, "role", "dialog"), a(e, "aria-modal", "true");
    },
    m(E, z) {
      m(E, e, z), u(e, t), u(t, n), u(n, i), u(t, o), u(t, s), u(s, c), u(s, f), u(s, y), le(g, y, null), u(y, k), d = !0, v || (M = [
        X(
          c,
          "click",
          /*click_handler_16*/
          l[71]
        ),
        X(
          y,
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
      ], v = !0);
    },
    p(E, z) {
      (!d || z[0] & /*confirmacion*/
      16384) && r !== (r = /*confirmacion*/
      E[14].texto + "") && te(i, r);
    },
    i(E) {
      d || (L(g.$$.fragment, E), d = !0);
    },
    o(E) {
      A(g.$$.fragment, E), d = !1;
    },
    d(E) {
      E && _(e), ne(g), v = !1, we(M);
    }
  };
}
function wr(l) {
  let e, t, n, r, i, o, s;
  const c = [Hn, Bn], f = [];
  function y(v, M) {
    return (
      /*denied*/
      v[10] ? 0 : 1
    );
  }
  e = y(l), t = f[e] = c[e](l);
  let g = !/*denied*/
  l[10] && !/*cargando*/
  l[8] && tl(l), k = (
    /*prodModal*/
    l[2] && il(l)
  ), d = (
    /*confirmacion*/
    l[14] && cl(l)
  );
  return {
    c() {
      t.c(), n = T(), g && g.c(), r = T(), k && k.c(), i = T(), d && d.c(), o = Oe();
    },
    m(v, M) {
      f[e].m(v, M), m(v, n, M), g && g.m(v, M), m(v, r, M), k && k.m(v, M), m(v, i, M), d && d.m(v, M), m(v, o, M), s = !0;
    },
    p(v, M) {
      let E = e;
      e = y(v), e === E ? f[e].p(v, M) : (ce(), A(f[E], 1, 1, () => {
        f[E] = null;
      }), ue(), t = f[e], t ? t.p(v, M) : (t = f[e] = c[e](v), t.c()), L(t, 1), t.m(n.parentNode, n)), !/*denied*/
      v[10] && !/*cargando*/
      v[8] ? g ? (g.p(v, M), M[0] & /*denied, cargando*/
      1280 && L(g, 1)) : (g = tl(v), g.c(), L(g, 1), g.m(r.parentNode, r)) : g && (ce(), A(g, 1, 1, () => {
        g = null;
      }), ue()), /*prodModal*/
      v[2] ? k ? k.p(v, M) : (k = il(v), k.c(), k.m(i.parentNode, i)) : k && (k.d(1), k = null), /*confirmacion*/
      v[14] ? d ? (d.p(v, M), M[0] & /*confirmacion*/
      16384 && L(d, 1)) : (d = cl(v), d.c(), L(d, 1), d.m(o.parentNode, o)) : d && (ce(), A(d, 1, 1, () => {
        d = null;
      }), ue());
    },
    i(v) {
      s || (L(t), L(g), L(d), s = !0);
    },
    o(v) {
      A(t), A(g), A(d), s = !1;
    },
    d(v) {
      v && (_(n), _(r), _(i), _(o)), f[e].d(v), g && g.d(v), k && k.d(v), d && d.d(v);
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
  let n = "trabajos", r = [], i = !1, o = null, s = null, c = !1, f = "";
  const y = ["Mesas", "Sillas", "Roperos", "Puertas", "Cocina"], g = ["Roble", "Mara", "Cedro", "Pino", "Melamina"], k = () => ({
    name: "",
    category: "Mesas",
    woodType: "Roble",
    dimensions: "180 x 90 x 76 cm",
    price: 1800,
    estimatedDays: 10,
    stock: 3,
    description: ""
  });
  let d = k();
  async function v() {
    t(1, r = await un().catch(() => []));
  }
  function M() {
    t(3, o = null), t(7, d = k()), t(4, s = null), t(6, f = ""), t(2, i = !0);
  }
  function E(P) {
    t(3, o = P), t(7, d = {
      name: P.name,
      category: P.category,
      woodType: P.woodType,
      dimensions: P.dimensions,
      price: P.price,
      estimatedDays: P.estimatedDays,
      stock: P.stock,
      description: P.description,
      imageUrl: P.imageUrl
    }), t(4, s = null), t(6, f = ""), t(2, i = !0);
  }
  async function z() {
    t(5, c = !0), t(6, f = "");
    try {
      let P = d.imageUrl;
      s && (P = await _n(s, "marketplace"));
      const ee = {
        ...d,
        imageUrl: P,
        price: Number(d.price),
        stock: Number(d.stock),
        estimatedDays: Number(d.estimatedDays ?? 10)
      };
      o ? await dn(o.id, ee) : await fn(ee), t(2, i = !1), t(13, Z = o ? "Mueble actualizado." : "Mueble publicado en el Marketplace."), setTimeout(() => t(13, Z = ""), 4e3), await v();
    } catch (P) {
      t(6, f = P.message);
    } finally {
      t(5, c = !1);
    }
  }
  function O(P) {
    t(14, U = {
      texto: `¿Quitar «${P.name}» del Marketplace?`,
      accion: async () => {
        await pn(P.id).catch(() => {
        }), t(13, Z = "Mueble eliminado."), setTimeout(() => t(13, Z = ""), 4e3), await v();
      }
    });
  }
  const h = {
    MARA: "Mara",
    ROBLE: "Roble",
    PINO: "Pino",
    CEDRO: "Cedro",
    CEREZO: "Cerezo",
    NOGAL: "Nogal",
    CAOBA: "Caoba",
    MDF: "MDF",
    TRIPLAY: "Triplay"
  }, N = {
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
  }, S = {
    MORNING: "por la mañana",
    AFTERNOON: "por la tarde",
    EVENING: "por la noche"
  }, I = {
    SCHEDULED: "Programada",
    IN_TRANSIT: "En camino",
    DELIVERED: "Entregada",
    FAILED: "No se pudo entregar",
    RESCHEDULED: "Cambiada de fecha"
  };
  let b = !0, w = "", C = !1, W = "", Y = [], F, Z = "", U = null, H = !1, $, V = "", R = [
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
    var P, ee;
    if (hn(), be = rn(() => {
      t(20, x = Ne());
    }), !vn()) {
      if (location.port === "4204" || location.hostname.startsWith("taller.")) {
        window.location.href = "/login";
        return;
      }
      t(10, C = !0), t(8, b = !1);
      return;
    }
    t(11, W = ((ee = (P = kt()) == null ? void 0 : P.email) == null ? void 0 : ee.split("@")[0]) ?? ""), v(), await Q(), F = setInterval(() => Q(!0), 15e3);
  }), Vl(() => {
    clearInterval(F), be && be();
  });
  async function Q(P = !1) {
    var ee;
    P || (t(8, b = !0), t(9, w = ""));
    try {
      const ge = await on(((ee = kt()) == null ? void 0 : ee.email) ?? "");
      ge && t(11, W = ge.name.split(" ")[0]);
      const Ol = ge ? await sn(ge.id) : [];
      t(12, Y = Ol.sort((Al, Pl) => {
        const Rl = Fe(Al) ?? "9999", zl = Fe(Pl) ?? "9999";
        return Rl.localeCompare(zl);
      })), !ge && !P && t(9, w = "No encontré tu ficha de carpintero. Pide al administrador que revise tu correo.");
    } catch {
      P || t(9, w = "No se pudo cargar la información. Toca Reintentar.");
    } finally {
      t(8, b = !1);
    }
  }
  function Ae() {
    for (const P of Y) {
      if (["DELIVERED", "CANCELLED"].includes(P.status)) continue;
      const ee = wl(P);
      if (ee) return { order: P, paso: ee };
    }
    return null;
  }
  function ye() {
    return Y.filter((P) => {
      var ee;
      return ((ee = P.delivery) == null ? void 0 : ee.scheduledDate) && !["DELIVERED"].includes(P.delivery.status);
    }).map((P) => ({
      ...P,
      d: gl(P.delivery.scheduledDate)
    })).sort((P, ee) => (P.d ?? 9999) - (ee.d ?? 9999));
  }
  function Pe() {
    return Y.reduce(
      (P, ee) => P + (["DELIVERED", "CANCELLED"].includes(ee.status) ? 0 : $r(ee)),
      0
    );
  }
  function De() {
    return Y.filter((P) => !["DELIVERED", "CANCELLED"].includes(P.status));
  }
  function $e(P) {
    const ee = P.status === "PENDING";
    t(14, U = {
      texto: ee ? `¿Vas a empezar «${P.name}»?` : `¿Ya terminaste «${P.name}»?`,
      accion: async () => {
        const ge = await an(P.id, ee ? "IN_PROGRESS" : "COMPLETED");
        t(13, Z = ge != null && ge.error ? `No se pudo guardar: ${ge.error}` : ee ? "Paso empezado. ¡Manos a la obra!" : "Muy bien. Paso terminado."), await Q(!0), setTimeout(() => t(13, Z = ""), 4e3);
      }
    });
  }
  async function Re() {
    const P = U == null ? void 0 : U.accion;
    t(14, U = null), P && await P();
  }
  function G() {
    kn(), window.location.href = "/login";
  }
  async function re(P) {
    const ee = (P ?? V).trim();
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
    nn(), t(20, x = Ne()), Q(!0), v();
  }, Se = () => t(0, n = "trabajos"), He = () => {
    t(0, n = "marketplace"), v();
  }, Qe = (P) => E(P), Ze = (P) => O(P), it = () => Q(), Le = (P) => $e(P.paso), _e = (P) => $e(P), Ce = (P) => $e(P), me = () => t(15, H = !0), he = () => t(15, H = !1), q = () => t(15, H = !1), ae = (P) => re(P);
  function J(P) {
    mt[P ? "unshift" : "push"](() => {
      $ = P, t(16, $);
    });
  }
  function ze() {
    V = this.value, t(17, V);
  }
  const El = (P) => P.key === "Enter" && re(), $l = () => re();
  function Dl() {
    d.name = this.value, t(7, d), t(21, y);
  }
  function Nl() {
    d.category = Tt(this), t(7, d), t(21, y);
  }
  function Tl() {
    d.woodType = Tt(this), t(7, d), t(21, y);
  }
  function Sl() {
    d.dimensions = this.value, t(7, d), t(21, y);
  }
  function Ml() {
    d.price = Ve(this.value), t(7, d), t(21, y);
  }
  function Ll() {
    d.stock = Ve(this.value), t(7, d), t(21, y);
  }
  function Cl() {
    d.estimatedDays = Ve(this.value), t(7, d), t(21, y);
  }
  function Il() {
    d.description = this.value, t(7, d), t(21, y);
  }
  return [
    n,
    r,
    i,
    o,
    s,
    c,
    f,
    d,
    b,
    w,
    C,
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
    y,
    g,
    v,
    M,
    E,
    z,
    O,
    h,
    N,
    S,
    I,
    Ee,
    fe,
    Q,
    Ae,
    ye,
    Pe,
    De,
    $e,
    Re,
    G,
    re,
    Me,
    Se,
    He,
    Qe,
    Ze,
    it,
    Le,
    _e,
    Ce,
    me,
    he,
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
    (P) => {
      var ee;
      return t(4, s = ((ee = P.currentTarget.files) == null ? void 0 : ee[0]) ?? null);
    },
    () => t(2, i = !1),
    () => t(2, i = !1),
    () => t(14, U = null),
    () => t(14, U = null)
  ];
}
class Nr extends vl {
  constructor(e) {
    super(), hl(this, e, Dr, wr, _l, {}, null, [-1, -1, -1, -1]);
  }
}
let xe = null, Xe = null;
async function Or() {
  if (!Xe) {
    Xe = document.createElement("link"), Xe.rel = "stylesheet";
    const l = typeof window < "u" ? window.location.hostname : "localhost", e = typeof window < "u" && window.location.protocol === "https:", t = l.replace(/^(www|admin|taller|api)\./, ""), n = e ? `https://taller.${t}` : `http://${l}:4204`;
    Xe.href = `${n}/mfe-assets/style.css`, document.head.appendChild(Xe);
  }
}
async function Ar(l) {
  const e = (l == null ? void 0 : l.domElement) ?? document.getElementById("workshop-slot");
  if (!e) throw new Error("workshop-slot no encontrado");
  xe = new Nr({ target: e });
}
async function Pr() {
  xe == null || xe.$destroy(), xe = null;
}
export {
  Or as bootstrap,
  Ar as mount,
  Pr as unmount
};
