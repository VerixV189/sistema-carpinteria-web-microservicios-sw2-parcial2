var xe = Object.defineProperty;
var et = (e, t, n) => t in e ? xe(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var _e = (e, t, n) => et(e, typeof t != "symbol" ? t + "" : t, n);
function x() {
}
function Qe(e) {
  return e();
}
function Le() {
  return /* @__PURE__ */ Object.create(null);
}
function ee(e) {
  e.forEach(Qe);
}
function Fe(e) {
  return typeof e == "function";
}
function tt(e, t) {
  return e != e ? t == t : e !== t || e && typeof e == "object" || typeof e == "function";
}
function nt(e) {
  return Object.keys(e).length === 0;
}
function o(e, t) {
  e.appendChild(t);
}
function M(e, t, n) {
  e.insertBefore(t, n || null);
}
function C(e) {
  e.parentNode && e.parentNode.removeChild(e);
}
function Pe(e, t) {
  for (let n = 0; n < e.length; n += 1)
    e[n] && e[n].d(t);
}
function c(e) {
  return document.createElement(e);
}
function P(e) {
  return document.createTextNode(e);
}
function v() {
  return P(" ");
}
function Ge() {
  return P("");
}
function V(e, t, n, l) {
  return e.addEventListener(t, n, l), () => e.removeEventListener(t, n, l);
}
function u(e, t, n) {
  n == null ? e.removeAttribute(t) : e.getAttribute(t) !== n && e.setAttribute(t, n);
}
function We(e) {
  return e === "" ? null : +e;
}
function lt(e) {
  return Array.from(e.childNodes);
}
function J(e, t) {
  t = "" + t, e.data !== t && (e.data = /** @type {string} */
  t);
}
function X(e, t) {
  e.value = t ?? "";
}
function ke(e, t, n, l) {
  n == null ? e.style.removeProperty(t) : e.style.setProperty(t, n, "");
}
function U(e, t, n) {
  e.classList.toggle(t, !!n);
}
let oe;
function se(e) {
  oe = e;
}
function st() {
  if (!oe) throw new Error("Function called outside component initialization");
  return oe;
}
function ot(e) {
  st().$$.on_mount.push(e);
}
const Y = [], Te = [];
let Z = [];
const Oe = [], it = /* @__PURE__ */ Promise.resolve();
let be = !1;
function at() {
  be || (be = !0, it.then(Ke));
}
function ye(e) {
  Z.push(e);
}
const ve = /* @__PURE__ */ new Set();
let K = 0;
function Ke() {
  if (K !== 0)
    return;
  const e = oe;
  do {
    try {
      for (; K < Y.length; ) {
        const t = Y[K];
        K++, se(t), rt(t.$$);
      }
    } catch (t) {
      throw Y.length = 0, K = 0, t;
    }
    for (se(null), Y.length = 0, K = 0; Te.length; ) Te.pop()();
    for (let t = 0; t < Z.length; t += 1) {
      const n = Z[t];
      ve.has(n) || (ve.add(n), n());
    }
    Z.length = 0;
  } while (Y.length);
  for (; Oe.length; )
    Oe.pop()();
  be = !1, ve.clear(), se(e);
}
function rt(e) {
  if (e.fragment !== null) {
    e.update(), ee(e.before_update);
    const t = e.dirty;
    e.dirty = [-1], e.fragment && e.fragment.p(e.ctx, t), e.after_update.forEach(ye);
  }
}
function ct(e) {
  const t = [], n = [];
  Z.forEach((l) => e.indexOf(l) === -1 ? t.push(l) : n.push(l)), n.forEach((l) => l()), Z = t;
}
const ut = /* @__PURE__ */ new Set();
function dt(e, t) {
  e && e.i && (ut.delete(e), e.i(t));
}
function ue(e) {
  return (e == null ? void 0 : e.length) !== void 0 ? e : Array.from(e);
}
function ft(e, t, n) {
  const { fragment: l, after_update: s } = e.$$;
  l && l.m(t, n), ye(() => {
    const i = e.$$.on_mount.map(Qe).filter(Fe);
    e.$$.on_destroy ? e.$$.on_destroy.push(...i) : ee(i), e.$$.on_mount = [];
  }), s.forEach(ye);
}
function mt(e, t) {
  const n = e.$$;
  n.fragment !== null && (ct(n.after_update), ee(n.on_destroy), n.fragment && n.fragment.d(t), n.on_destroy = n.fragment = null, n.ctx = []);
}
function ht(e, t) {
  e.$$.dirty[0] === -1 && (Y.push(e), at(), e.$$.dirty.fill(0)), e.$$.dirty[t / 31 | 0] |= 1 << t % 31;
}
function pt(e, t, n, l, s, i, r = null, m = [-1]) {
  const h = oe;
  se(e);
  const a = e.$$ = {
    fragment: null,
    ctx: [],
    // state
    props: i,
    update: x,
    not_equal: s,
    bound: Le(),
    // lifecycle
    on_mount: [],
    on_destroy: [],
    on_disconnect: [],
    before_update: [],
    after_update: [],
    context: new Map(t.context || (h ? h.$$.context : [])),
    // everything else
    callbacks: Le(),
    dirty: m,
    skip_bound: !1,
    root: t.target || h.$$.root
  };
  r && r(a.root);
  let p = !1;
  if (a.ctx = n ? n(e, t.props || {}, (_, D, ...w) => {
    const b = w.length ? w[0] : D;
    return a.ctx && s(a.ctx[_], a.ctx[_] = b) && (!a.skip_bound && a.bound[_] && a.bound[_](b), p && ht(e, _)), D;
  }) : [], a.update(), p = !0, ee(a.before_update), a.fragment = l ? l(a.ctx) : !1, t.target) {
    if (t.hydrate) {
      const _ = lt(t.target);
      a.fragment && a.fragment.l(_), _.forEach(C);
    } else
      a.fragment && a.fragment.c();
    t.intro && dt(e.$$.fragment), ft(e, t.target, t.anchor), Ke();
  }
  se(h);
}
class gt {
  constructor() {
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    _e(this, "$$");
    /**
     * ### PRIVATE API
     *
     * Do not use, may change at any time
     *
     * @type {any}
     */
    _e(this, "$$set");
  }
  /** @returns {void} */
  $destroy() {
    mt(this, 1), this.$destroy = x;
  }
  /**
   * @template {Extract<keyof Events, string>} K
   * @param {K} type
   * @param {((e: Events[K]) => void) | null | undefined} callback
   * @returns {() => void}
   */
  $on(t, n) {
    if (!Fe(n))
      return x;
    const l = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
    return l.push(n), () => {
      const s = l.indexOf(n);
      s !== -1 && l.splice(s, 1);
    };
  }
  /**
   * @param {Partial<Props>} props
   * @returns {void}
   */
  $set(t) {
    this.$$set && !nt(t) && (this.$$.skip_bound = !0, this.$$set(t), this.$$.skip_bound = !1);
  }
}
const _t = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = { v: /* @__PURE__ */ new Set() })).v.add(_t);
const Ye = "http://localhost:3000/api/ai", vt = "http://localhost:3000/graphql";
function Se() {
  const e = localStorage.getItem("carpinteria_token");
  return { "Content-Type": "application/json", ...e ? { Authorization: `Bearer ${e}` } : {} };
}
async function Xe(e, t = {}) {
  return (await fetch(vt, { method: "POST", headers: Se(), body: JSON.stringify({ query: e, variables: t }) })).json();
}
async function wt(e) {
  return (await fetch(`${Ye}/delivery/check?date=${encodeURIComponent(e)}`, { headers: Se() })).json();
}
async function bt(e, t) {
  var l, s, i;
  const n = await Xe(
    "mutation($input: ScheduleDeliveryInput!) { scheduleDelivery(input: $input) { id scheduledDate status } }",
    { input: { orderId: String(e), scheduledDate: t, timeSlot: "MORNING" } }
  );
  return ((l = n.data) == null ? void 0 : l.scheduleDelivery) ?? { error: (i = (s = n.errors) == null ? void 0 : s[0]) == null ? void 0 : i.message };
}
async function we() {
  var t;
  return ((t = (await Xe("{ deliveries { id orderId scheduledDate status timeSlot } }")).data) == null ? void 0 : t.deliveries) ?? [];
}
async function yt(e) {
  const t = localStorage.getItem("agent_session") ?? (() => {
    const l = crypto.randomUUID();
    return localStorage.setItem("agent_session", l), l;
  })();
  return (await fetch(`${Ye}/agent`, {
    method: "POST",
    headers: Se(),
    body: JSON.stringify({ query: e, session_id: t })
  })).json();
}
const de = "carpinteria_session";
function kt(e) {
  try {
    return JSON.parse(atob(e.split(".")[1])).role ?? "CLIENT";
  } catch {
    return "CLIENT";
  }
}
function Ze() {
  try {
    const e = localStorage.getItem(de);
    if (!e) return null;
    const t = JSON.parse(e), n = JSON.parse(atob(t.token.split(".")[1])).exp;
    return n && n * 1e3 < Date.now() ? (localStorage.removeItem(de), null) : t;
  } catch {
    return null;
  }
}
function St() {
  const e = new URLSearchParams(window.location.search), t = e.get("token");
  if (!t) return;
  const n = { token: t, email: e.get("email") ?? "", role: kt(t) };
  localStorage.setItem(de, JSON.stringify(n)), e.delete("token"), e.delete("email");
  const l = e.toString();
  window.history.replaceState({}, "", window.location.pathname + (l ? `?${l}` : ""));
}
function Et() {
  const e = Ze();
  return !!e && (e.role === "CARPENTER" || e.role === "ADMIN");
}
function Ct() {
  localStorage.removeItem(de);
}
function He(e, t, n) {
  const l = e.slice();
  return l[17] = t[n], l;
}
function je(e, t, n) {
  const l = e.slice();
  return l[20] = t[n], l;
}
function It(e) {
  let t, n, l, s, i, r, m, h, a, p, _, D, w, b, H, L, R, k, T, y, z, Ee, ie, Ce, B, fe, Ie, Q, O, Me, q, ae = (
    /*agentLoading*/
    e[7] ? "…" : "Preguntar"
  ), me, $e, j, re, Ne, he, F, pe, Ae, ce, ge, De, I = (
    /*capacity*/
    e[2] && Re(e)
  ), $ = (
    /*scheduled*/
    e[4] && Ve()
  ), G = ue(
    /*agentMsgs*/
    e[6]
  ), S = [];
  for (let d = 0; d < G.length; d += 1)
    S[d] = Je(je(e, G, d));
  let N = (
    /*agentLoading*/
    e[7] && Ue()
  ), A = (
    /*deliveries*/
    e[3].length === 0 && qe()
  ), W = ue(
    /*deliveries*/
    e[3]
  ), E = [];
  for (let d = 0; d < W.length; d += 1)
    E[d] = ze(He(e, W, d));
  return {
    c() {
      var d;
      t = c("header"), n = c("div"), n.innerHTML = '<span class="logo svelte-1mm14dw">ER</span><strong>Taller — Entregas (CU4)</strong>', l = v(), s = c("div"), i = c("span"), i.textContent = `${(d = Ze()) == null ? void 0 : d.email}`, r = v(), m = c("button"), m.innerHTML = `<svg viewBox="0 0 24 24" class="svelte-1mm14dw"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><path d="M16 17l5-5-5-5"></path><path d="M21 12H9"></path></svg>
      Salir`, h = v(), a = c("main"), p = c("section"), _ = c("h2"), _.innerHTML = `<svg class="ico svelte-1mm14dw" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path></svg>
      Verificar capacidad de entrega`, D = v(), w = c("div"), b = c("input"), H = v(), L = c("button"), L.textContent = "Verificar", R = v(), I && I.c(), k = v(), $ && $.c(), T = v(), y = c("section"), z = c("h2"), z.innerHTML = `<svg class="ico svelte-1mm14dw" viewBox="0 0 24 24"><path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1 3 3.87V14a4 4 0 0 1-4 4h-1v4"></path><path d="M12 2a4 4 0 0 0-4 4v1a4 4 0 0 0-3 3.87V14a4 4 0 0 0 4 4h1"></path><path d="M9 22h6"></path></svg>
      Asistente inteligente (MCP)`, Ee = v(), ie = c("p"), ie.textContent = 'Ej: "¿Qué día se entrega el pedido #1?", "¿Hay cupo el 2026-11-05?", "Agenda el pedido 3 para el 2026-11-06"', Ce = v(), B = c("div");
      for (let g = 0; g < S.length; g += 1)
        S[g].c();
      fe = v(), N && N.c(), Ie = v(), Q = c("div"), O = c("input"), Me = v(), q = c("button"), me = P(ae), $e = v(), j = c("section"), re = c("h2"), re.innerHTML = `<svg class="ico svelte-1mm14dw" viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22V12"></path></svg>
      Entregas programadas`, Ne = v(), A && A.c(), he = v(), F = c("table"), pe = c("thead"), pe.innerHTML = '<tr><th class="svelte-1mm14dw">ID</th><th class="svelte-1mm14dw">Pedido</th><th class="svelte-1mm14dw">Fecha</th><th class="svelte-1mm14dw">Turno</th><th class="svelte-1mm14dw">Estado</th></tr>', Ae = v(), ce = c("tbody");
      for (let g = 0; g < E.length; g += 1)
        E[g].c();
      u(n, "class", "brand svelte-1mm14dw"), u(m, "class", "out svelte-1mm14dw"), u(s, "class", "who svelte-1mm14dw"), u(t, "class", "topbar svelte-1mm14dw"), u(_, "class", "svelte-1mm14dw"), u(b, "type", "date"), u(b, "class", "svelte-1mm14dw"), u(L, "class", "svelte-1mm14dw"), u(w, "class", "row svelte-1mm14dw"), u(p, "class", "card svelte-1mm14dw"), u(z, "class", "svelte-1mm14dw"), u(ie, "class", "hint svelte-1mm14dw"), u(B, "class", "chat svelte-1mm14dw"), u(O, "type", "text"), u(O, "placeholder", "Pregunta al asistente…"), ke(O, "flex", "1"), u(O, "class", "svelte-1mm14dw"), q.disabled = /*agentLoading*/
      e[7], u(q, "class", "svelte-1mm14dw"), u(Q, "class", "row svelte-1mm14dw"), u(y, "class", "card svelte-1mm14dw"), u(re, "class", "svelte-1mm14dw"), u(F, "class", "svelte-1mm14dw"), u(j, "class", "card svelte-1mm14dw"), u(a, "class", "svelte-1mm14dw");
    },
    m(d, g) {
      M(d, t, g), o(t, n), o(t, l), o(t, s), o(s, i), o(s, r), o(s, m), M(d, h, g), M(d, a, g), o(a, p), o(p, _), o(p, D), o(p, w), o(w, b), X(
        b,
        /*date*/
        e[0]
      ), o(w, H), o(w, L), o(p, R), I && I.m(p, null), o(p, k), $ && $.m(p, null), o(a, T), o(a, y), o(y, z), o(y, Ee), o(y, ie), o(y, Ce), o(y, B);
      for (let f = 0; f < S.length; f += 1)
        S[f] && S[f].m(B, null);
      o(B, fe), N && N.m(B, null), o(y, Ie), o(y, Q), o(Q, O), X(
        O,
        /*agentQuery*/
        e[5]
      ), o(Q, Me), o(Q, q), o(q, me), o(a, $e), o(a, j), o(j, re), o(j, Ne), A && A.m(j, null), o(j, he), o(j, F), o(F, pe), o(F, Ae), o(F, ce);
      for (let f = 0; f < E.length; f += 1)
        E[f] && E[f].m(ce, null);
      ge || (De = [
        V(
          m,
          "click",
          /*salir*/
          e[9]
        ),
        V(
          b,
          "input",
          /*input0_input_handler*/
          e[13]
        ),
        V(
          L,
          "click",
          /*check*/
          e[10]
        ),
        V(
          O,
          "input",
          /*input1_input_handler*/
          e[15]
        ),
        V(
          O,
          "keydown",
          /*keydown_handler*/
          e[16]
        ),
        V(
          q,
          "click",
          /*ask*/
          e[12]
        )
      ], ge = !0);
    },
    p(d, g) {
      if (g & /*date*/
      1 && X(
        b,
        /*date*/
        d[0]
      ), /*capacity*/
      d[2] ? I ? I.p(d, g) : (I = Re(d), I.c(), I.m(p, k)) : I && (I.d(1), I = null), /*scheduled*/
      d[4] ? $ || ($ = Ve(), $.c(), $.m(p, null)) : $ && ($.d(1), $ = null), g & /*agentMsgs*/
      64) {
        G = ue(
          /*agentMsgs*/
          d[6]
        );
        let f;
        for (f = 0; f < G.length; f += 1) {
          const te = je(d, G, f);
          S[f] ? S[f].p(te, g) : (S[f] = Je(te), S[f].c(), S[f].m(B, fe));
        }
        for (; f < S.length; f += 1)
          S[f].d(1);
        S.length = G.length;
      }
      if (/*agentLoading*/
      d[7] ? N || (N = Ue(), N.c(), N.m(B, null)) : N && (N.d(1), N = null), g & /*agentQuery*/
      32 && O.value !== /*agentQuery*/
      d[5] && X(
        O,
        /*agentQuery*/
        d[5]
      ), g & /*agentLoading*/
      128 && ae !== (ae = /*agentLoading*/
      d[7] ? "…" : "Preguntar") && J(me, ae), g & /*agentLoading*/
      128 && (q.disabled = /*agentLoading*/
      d[7]), /*deliveries*/
      d[3].length === 0 ? A || (A = qe(), A.c(), A.m(j, he)) : A && (A.d(1), A = null), g & /*deliveries*/
      8) {
        W = ue(
          /*deliveries*/
          d[3]
        );
        let f;
        for (f = 0; f < W.length; f += 1) {
          const te = He(d, W, f);
          E[f] ? E[f].p(te, g) : (E[f] = ze(te), E[f].c(), E[f].m(ce, null));
        }
        for (; f < E.length; f += 1)
          E[f].d(1);
        E.length = W.length;
      }
    },
    d(d) {
      d && (C(t), C(h), C(a)), I && I.d(), $ && $.d(), Pe(S, d), N && N.d(), A && A.d(), Pe(E, d), ge = !1, ee(De);
    }
  };
}
function Mt(e) {
  let t;
  return {
    c() {
      t = c("main"), t.innerHTML = '<section class="card svelte-1mm14dw"><p>Acceso denegado — se requiere rol de taller o administrador.</p></section>', u(t, "class", "svelte-1mm14dw");
    },
    m(n, l) {
      M(n, t, l);
    },
    p: x,
    d(n) {
      n && C(t);
    }
  };
}
function Re(e) {
  let t, n = (
    /*capacity*/
    e[2].message + ""
  ), l, s, i, r = (
    /*capacity*/
    e[2].hasCapacity && Be(e)
  );
  return {
    c() {
      t = c("p"), l = P(n), s = v(), r && r.c(), i = Ge(), u(t, "class", "result svelte-1mm14dw"), U(
        t,
        "ok",
        /*capacity*/
        e[2].hasCapacity
      ), U(
        t,
        "no",
        /*capacity*/
        e[2].hasCapacity === !1
      );
    },
    m(m, h) {
      M(m, t, h), o(t, l), M(m, s, h), r && r.m(m, h), M(m, i, h);
    },
    p(m, h) {
      h & /*capacity*/
      4 && n !== (n = /*capacity*/
      m[2].message + "") && J(l, n), h & /*capacity*/
      4 && U(
        t,
        "ok",
        /*capacity*/
        m[2].hasCapacity
      ), h & /*capacity*/
      4 && U(
        t,
        "no",
        /*capacity*/
        m[2].hasCapacity === !1
      ), /*capacity*/
      m[2].hasCapacity ? r ? r.p(m, h) : (r = Be(m), r.c(), r.m(i.parentNode, i)) : r && (r.d(1), r = null);
    },
    d(m) {
      m && (C(t), C(s), C(i)), r && r.d(m);
    }
  };
}
function Be(e) {
  let t, n, l, s, i, r, m, h;
  return {
    c() {
      t = c("div"), n = c("label"), l = P("Pedido # "), s = c("input"), i = v(), r = c("button"), r.textContent = "Agendar entrega", u(s, "type", "number"), ke(s, "width", "80px"), u(s, "class", "svelte-1mm14dw"), u(r, "class", "primary svelte-1mm14dw"), u(t, "class", "row svelte-1mm14dw");
    },
    m(a, p) {
      M(a, t, p), o(t, n), o(n, l), o(n, s), X(
        s,
        /*orderId*/
        e[1]
      ), o(t, i), o(t, r), m || (h = [
        V(
          s,
          "input",
          /*input_input_handler*/
          e[14]
        ),
        V(
          r,
          "click",
          /*schedule*/
          e[11]
        )
      ], m = !0);
    },
    p(a, p) {
      p & /*orderId*/
      2 && We(s.value) !== /*orderId*/
      a[1] && X(
        s,
        /*orderId*/
        a[1]
      );
    },
    d(a) {
      a && C(t), m = !1, ee(h);
    }
  };
}
function Ve(e) {
  let t;
  return {
    c() {
      t = c("p"), t.textContent = "Entrega agendada.", u(t, "class", "ok svelte-1mm14dw");
    },
    m(n, l) {
      M(n, t, l);
    },
    d(n) {
      n && C(t);
    }
  };
}
function Je(e) {
  let t, n = (
    /*m*/
    e[20].text + ""
  ), l;
  return {
    c() {
      t = c("div"), l = P(n), u(t, "class", "bubble svelte-1mm14dw"), U(
        t,
        "bubble-user",
        /*m*/
        e[20].role === "user"
      ), U(
        t,
        "bubble-agent",
        /*m*/
        e[20].role === "agent"
      );
    },
    m(s, i) {
      M(s, t, i), o(t, l);
    },
    p(s, i) {
      i & /*agentMsgs*/
      64 && n !== (n = /*m*/
      s[20].text + "") && J(l, n), i & /*agentMsgs*/
      64 && U(
        t,
        "bubble-user",
        /*m*/
        s[20].role === "user"
      ), i & /*agentMsgs*/
      64 && U(
        t,
        "bubble-agent",
        /*m*/
        s[20].role === "agent"
      );
    },
    d(s) {
      s && C(t);
    }
  };
}
function Ue(e) {
  let t;
  return {
    c() {
      t = c("div"), t.textContent = "Escribiendo…", u(t, "class", "bubble bubble-agent svelte-1mm14dw"), ke(t, "opacity", ".6");
    },
    m(n, l) {
      M(n, t, l);
    },
    d(n) {
      n && C(t);
    }
  };
}
function qe(e) {
  let t;
  return {
    c() {
      t = c("p"), t.textContent = "Sin entregas programadas.", u(t, "class", "empty svelte-1mm14dw");
    },
    m(n, l) {
      M(n, t, l);
    },
    d(n) {
      n && C(t);
    }
  };
}
function ze(e) {
  let t, n, l = (
    /*d*/
    e[17].id + ""
  ), s, i, r, m = (
    /*d*/
    e[17].orderId + ""
  ), h, a, p = (
    /*d*/
    e[17].scheduledDate + ""
  ), _, D, w = (
    /*d*/
    e[17].timeSlot + ""
  ), b, H, L = (
    /*d*/
    e[17].status + ""
  ), R;
  return {
    c() {
      t = c("tr"), n = c("td"), s = P(l), i = c("td"), r = P("#"), h = P(m), a = c("td"), _ = P(p), D = c("td"), b = P(w), H = c("td"), R = P(L), u(n, "class", "svelte-1mm14dw"), u(i, "class", "svelte-1mm14dw"), u(a, "class", "svelte-1mm14dw"), u(D, "class", "svelte-1mm14dw"), u(H, "class", "svelte-1mm14dw");
    },
    m(k, T) {
      M(k, t, T), o(t, n), o(n, s), o(t, i), o(i, r), o(i, h), o(t, a), o(a, _), o(t, D), o(D, b), o(t, H), o(H, R);
    },
    p(k, T) {
      T & /*deliveries*/
      8 && l !== (l = /*d*/
      k[17].id + "") && J(s, l), T & /*deliveries*/
      8 && m !== (m = /*d*/
      k[17].orderId + "") && J(h, m), T & /*deliveries*/
      8 && p !== (p = /*d*/
      k[17].scheduledDate + "") && J(_, p), T & /*deliveries*/
      8 && w !== (w = /*d*/
      k[17].timeSlot + "") && J(b, w), T & /*deliveries*/
      8 && L !== (L = /*d*/
      k[17].status + "") && J(R, L);
    },
    d(k) {
      k && C(t);
    }
  };
}
function $t(e) {
  let t;
  function n(i, r) {
    return (
      /*denied*/
      i[8] ? Mt : It
    );
  }
  let l = n(e), s = l(e);
  return {
    c() {
      s.c(), t = Ge();
    },
    m(i, r) {
      s.m(i, r), M(i, t, r);
    },
    p(i, [r]) {
      l === (l = n(i)) && s ? s.p(i, r) : (s.d(1), s = l(i), s && (s.c(), s.m(t.parentNode, t)));
    },
    i: x,
    o: x,
    d(i) {
      i && C(t), s.d(i);
    }
  };
}
function Nt(e, t, n) {
  let l = "", s = 1, i = null, r = [], m = !1, h = "", a = [
    {
      role: "agent",
      text: "Hola. Puedo consultar entregas, verificar cupo, agendar pedidos y revisar inventario."
    }
  ], p = !1, _ = !1;
  ot(async () => {
    if (St(), !Et()) {
      if (location.port === "4204") {
        window.location.href = "/login";
        return;
      }
      n(8, _ = !0);
      return;
    }
    n(3, r = await we().catch(() => []));
  });
  function D() {
    Ct(), window.location.href = "/login";
  }
  async function w() {
    n(2, i = await wt(l));
  }
  async function b() {
    await bt(s, l), n(4, m = !0), n(3, r = await we().catch(() => []));
  }
  async function H() {
    const y = h.trim();
    if (!(!y || p)) {
      n(5, h = ""), n(6, a = [...a, { role: "user", text: y }]), n(7, p = !0);
      try {
        const z = await yt(y);
        n(6, a = [
          ...a,
          {
            role: "agent",
            text: z.answer ?? "Sin respuesta."
          }
        ]), n(3, r = await we().catch(() => r));
      } catch {
        n(6, a = [
          ...a,
          {
            role: "agent",
            text: "El asistente no está disponible."
          }
        ]);
      } finally {
        n(7, p = !1);
      }
    }
  }
  function L() {
    l = this.value, n(0, l);
  }
  function R() {
    s = We(this.value), n(1, s);
  }
  function k() {
    h = this.value, n(5, h);
  }
  return [
    l,
    s,
    i,
    r,
    m,
    h,
    a,
    p,
    _,
    D,
    w,
    b,
    H,
    L,
    R,
    k,
    (y) => y.key === "Enter" && H()
  ];
}
class At extends gt {
  constructor(t) {
    super(), pt(this, t, Nt, $t, tt, {});
  }
}
let le = null, ne = null;
async function Lt() {
  ne || (ne = document.createElement("link"), ne.rel = "stylesheet", ne.href = "http://localhost:4204/mfe-assets/style.css", document.head.appendChild(ne));
}
async function Pt(e) {
  const t = (e == null ? void 0 : e.domElement) ?? document.getElementById("workshop-slot");
  if (!t) throw new Error("workshop-slot no encontrado");
  le = new At({ target: t });
}
async function Tt() {
  le == null || le.$destroy(), le = null;
}
export {
  Lt as bootstrap,
  Pt as mount,
  Tt as unmount
};
