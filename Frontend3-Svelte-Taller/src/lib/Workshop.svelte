<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    findMyCarpenter, myOrders, updateStep, askAgent,
    listProducts, createProduct, updateProduct, deleteProduct, uploadImageToS3,
    type MarketplaceProduct, type UpsertProductPayload,
  } from './api';

  // ─── Marketplace (muebles en venta) ─────────────────────────────────────────
  let tab: 'trabajos' | 'marketplace' = 'trabajos';
  let productos: MarketplaceProduct[] = [];
  let prodModal = false;
  let prodEditando: MarketplaceProduct | null = null;
  let prodFoto: File | null = null;
  let prodGuardando = false;
  let prodError = '';
  const CATEGORIAS = ['Mesas', 'Sillas', 'Roperos', 'Puertas', 'Cocina'];
  const MADERAS = ['Roble', 'Mara', 'Cedro', 'Pino', 'Melamina'];
  const nuevoForm = (): UpsertProductPayload => ({
    name: '', category: 'Mesas', woodType: 'Roble', dimensions: '180 x 90 x 76 cm',
    price: 1800, estimatedDays: 10, stock: 3, description: '',
  });
  let prodForm: UpsertProductPayload = nuevoForm();

  async function cargarProductos() {
    productos = await listProducts().catch(() => []);
  }
  function abrirNuevo() {
    prodEditando = null; prodForm = nuevoForm(); prodFoto = null; prodError = ''; prodModal = true;
  }
  function abrirEditar(p: MarketplaceProduct) {
    prodEditando = p;
    prodForm = {
      name: p.name, category: p.category, woodType: p.woodType, dimensions: p.dimensions,
      price: p.price, estimatedDays: p.estimatedDays, stock: p.stock,
      description: p.description, imageUrl: p.imageUrl,
    };
    prodFoto = null; prodError = ''; prodModal = true;
  }
  async function guardarProducto() {
    prodGuardando = true; prodError = '';
    try {
      let imageUrl = prodForm.imageUrl;
      if (prodFoto) imageUrl = await uploadImageToS3(prodFoto, 'marketplace');
      const payload = {
        ...prodForm, imageUrl,
        price: Number(prodForm.price), stock: Number(prodForm.stock),
        estimatedDays: Number(prodForm.estimatedDays ?? 10),
      };
      if (prodEditando) await updateProduct(prodEditando.id, payload);
      else await createProduct(payload);
      prodModal = false;
      aviso = prodEditando ? 'Mueble actualizado.' : 'Mueble publicado en el Marketplace.';
      setTimeout(() => (aviso = ''), 4000);
      await cargarProductos();
    } catch (e) {
      prodError = (e as Error).message;
    } finally {
      prodGuardando = false;
    }
  }
  function pedirEliminar(p: MarketplaceProduct) {
    confirmacion = {
      texto: `¿Quitar «${p.name}» del Marketplace?`,
      accion: async () => {
        await deleteProduct(p.id).catch(() => undefined);
        aviso = 'Mueble eliminado.';
        setTimeout(() => (aviso = ''), 4000);
        await cargarProductos();
      },
    };
  }
  import { requireWorkshop, session, logout, acceptHandoff } from './auth';
  import Icon from './Icon.svelte';

  // ─── Textos en palabras simples ─────────────────────────────────────────────
  const WOOD: Record<string, string> = {
    MARA: 'Mara', ROBLE: 'Roble', PINO: 'Pino', CEDRO: 'Cedro', CEREZO: 'Cerezo',
    NOGAL: 'Nogal', CAOBA: 'Caoba', MDF: 'MDF', TRIPLAY: 'Triplay',
  };
  const FURNITURE: Record<string, string> = {
    DOOR: 'Puerta', WINDOW: 'Ventana', TABLE: 'Mesa', CHAIR: 'Silla',
    BED: 'Cama', WARDROBE: 'Ropero', KITCHEN: 'Mueble de cocina', SHELF: 'Estante',
    DESK: 'Escritorio', OTHER: 'Mueble',
  };
  const ORDER_STATUS: Record<string, string> = {
    PENDING: 'Por hacer', APPROVED: 'Aprobado', IN_PRODUCTION: 'En trabajo',
    READY: 'Listo para entregar', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
  };
  const SLOT: Record<string, string> = {
    MORNING: 'por la mañana', AFTERNOON: 'por la tarde', EVENING: 'por la noche',
  };
  const DELIVERY_STATUS: Record<string, string> = {
    SCHEDULED: 'Programada', IN_TRANSIT: 'En camino', DELIVERED: 'Entregada',
    FAILED: 'No se pudo entregar', RESCHEDULED: 'Cambiada de fecha',
  };

  function fechaBonita(iso: string | null | undefined): string {
    if (!iso) return 'sin fecha';
    const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
    if (isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
  }

  // ─── Urgencia: días que faltan para entregar ────────────────────────────────
  function fechaEntrega(o: any): string | null {
    return o.delivery?.scheduledDate ?? o.deliveryDate ?? null;
  }
  function diasQueFaltan(iso: string | null): number | null {
    if (!iso) return null;
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''));
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - hoy.getTime()) / 86400000);
  }
  function urgencia(o: any): { texto: string; nivel: 'rojo' | 'ambar' | 'ok' | 'gris' } | null {
    if (['DELIVERED', 'CANCELLED'].includes(o.status)) return null;
    const d = diasQueFaltan(fechaEntrega(o));
    if (d === null) return null;
    if (d < 0) return { texto: `Atrasado ${-d} día${-d === 1 ? '' : 's'}`, nivel: 'rojo' };
    if (d === 0) return { texto: '¡Para hoy!', nivel: 'rojo' };
    if (d === 1) return { texto: '¡Para mañana!', nivel: 'rojo' };
    if (d <= 3) return { texto: `Faltan ${d} días`, nivel: 'ambar' };
    return { texto: `Faltan ${d} días`, nivel: 'ok' };
  }

  // ─── Estado ─────────────────────────────────────────────────────────────────
  let cargando = true;
  let error = '';
  let denied = false;
  let nombre = '';
  let orders: any[] = [];
  let timer: ReturnType<typeof setInterval>;
  let aviso = '';
  let confirmacion: { texto: string; accion: () => Promise<void> } | null = null;
  let chatAbierto = false;
  let chatBox: HTMLDivElement;
  let agentQuery = '';
  let agentMsgs: { role: 'user' | 'agent'; text: string }[] = [
    { role: 'agent', text: 'Hola. Toca una pregunta o escríbeme tu duda.' },
  ];
  let agentLoading = false;

  const PREGUNTAS = [
    '¿Qué tengo que hacer hoy?',
    '¿Cuándo es mi próxima entrega?',
    '¿A dónde entrego mi próximo pedido?',
  ];

  onMount(async () => {
    acceptHandoff();
    if (!requireWorkshop()) {
      if (location.port === '4204' || location.hostname.startsWith('taller.')) { window.location.href = '/login'; return; }
      denied = true;
      cargando = false;
      return;
    }
    nombre = session()?.email?.split('@')[0] ?? '';
    cargarProductos();
    await cargar();
    timer = setInterval(() => cargar(true), 15000);
  });

  onDestroy(() => clearInterval(timer));

  async function cargar(silencioso = false) {
    if (!silencioso) { cargando = true; error = ''; }
    try {
      const me = await findMyCarpenter(session()?.email ?? '');
      if (me) nombre = me.name.split(' ')[0];
      const lista = me ? await myOrders(me.id) : [];
      // Lo más urgente primero (por fecha de entrega); sin fecha al final
      orders = lista.sort((a, b) => {
        const fa = fechaEntrega(a) ?? '9999';
        const fb = fechaEntrega(b) ?? '9999';
        return fa.localeCompare(fb);
      });
      if (!me && !silencioso) error = 'No encontré tu ficha de carpintero. Pide al administrador que revise tu correo.';
    } catch {
      if (!silencioso) error = 'No se pudo cargar la información. Toca Reintentar.';
    } finally {
      cargando = false;
    }
  }

  // ─── Pasos ──────────────────────────────────────────────────────────────────
  function pasosOrdenados(o: any) {
    return [...(o.steps ?? [])].sort((a, b) => a.sequence - b.sequence);
  }
  function pasosHechos(o: any) {
    return pasosOrdenados(o).filter((s) => s.status === 'COMPLETED').length;
  }
  function pasosPendientes(o: any) {
    return pasosOrdenados(o).filter((s) => s.status !== 'COMPLETED').length;
  }
  function siguientePaso(o: any) {
    return pasosOrdenados(o).find((s) => s.status !== 'COMPLETED') ?? null;
  }
  function progreso(o: any) {
    const total = pasosOrdenados(o).length;
    return total ? Math.round((pasosHechos(o) / total) * 100) : 0;
  }
  function trabajoTerminado(o: any) {
    const p = pasosOrdenados(o);
    return p.length > 0 && p.every((s) => s.status === 'COMPLETED');
  }

  // ─── Predictivo: la acción más urgente ──────────────────────────────────────
  function siguienteAccion(): { order: any; paso: any } | null {
    for (const o of orders) {
      if (['DELIVERED', 'CANCELLED'].includes(o.status)) continue;
      const p = siguientePaso(o);
      if (p) return { order: o, paso: p };
    }
    return null;
  }
  function entregasProximas() {
    return orders
      .filter((o) => o.delivery?.scheduledDate && !['DELIVERED'].includes(o.delivery.status))
      .map((o) => ({ ...o, d: diasQueFaltan(o.delivery.scheduledDate) }))
      .sort((a, b) => (a.d ?? 9999) - (b.d ?? 9999));
  }
  function totalPendientes() {
    return orders.reduce((n, o) => n + (['DELIVERED', 'CANCELLED'].includes(o.status) ? 0 : pasosPendientes(o)), 0);
  }
  function activos() {
    return orders.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
  }

  // ─── Confirmación y acciones ────────────────────────────────────────────────
  function pedirConfirmacionPaso(paso: any) {
    const empieza = paso.status === 'PENDING';
    confirmacion = {
      texto: empieza ? `¿Vas a empezar «${paso.name}»?` : `¿Ya terminaste «${paso.name}»?`,
      accion: async () => {
        const r = await updateStep(paso.id, empieza ? 'IN_PROGRESS' : 'COMPLETED');
        aviso = r?.error
          ? `No se pudo guardar: ${r.error}`
          : empieza ? 'Paso empezado. ¡Manos a la obra!' : 'Muy bien. Paso terminado.';
        await cargar(true);
        setTimeout(() => (aviso = ''), 4000);
      },
    };
  }
  async function confirmar() {
    const a = confirmacion?.accion;
    confirmacion = null;
    if (a) await a();
  }

  function salir() {
    logout();
    window.location.href = '/login';
  }

  async function ask(pregunta?: string) {
    const text = (pregunta ?? agentQuery).trim();
    if (!text || agentLoading) return;
    agentQuery = '';
    agentMsgs = [...agentMsgs, { role: 'user', text }];
    agentLoading = true;
    try {
      const r = await askAgent(text);
      agentMsgs = [...agentMsgs, { role: 'agent', text: r.answer ?? 'No supe responder.' }];
    } catch {
      agentMsgs = [...agentMsgs, { role: 'agent', text: 'El asistente no está disponible ahora.' }];
    } finally {
      agentLoading = false;
    }
    setTimeout(() => chatBox?.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' }), 50);
  }
</script>

{#if denied}
  <main><section class="card"><p class="big">No puedes entrar aquí. Esta zona es solo para el taller.</p></section></main>
{:else}
<header class="topbar">
  <div class="brand"><Icon name="hammer" size={22} /><strong>Mi Taller</strong></div>
  <div class="who">
    <span class="hola">Hola, <b>{nombre}</b></span>
    <button class="out" on:click={salir}><Icon name="logout" size={15} /> Salir</button>
  </div>
</header>

<main class:con-chat={chatAbierto}>
  <div class="tabs">
    <button class="tab" class:tab-on={tab === 'trabajos'} on:click={() => (tab = 'trabajos')}>
      <Icon name="clipboard" size={18} /> Mis trabajos
    </button>
    <button class="tab" class:tab-on={tab === 'marketplace'} on:click={() => { tab = 'marketplace'; cargarProductos(); }}>
      <Icon name="store" size={18} /> Muebles en venta
    </button>
  </div>

  {#if tab === 'marketplace'}
    {#if aviso}<p class="aviso"><Icon name="check-circle" size={20} /> {aviso}</p>{/if}
    <div class="mk-head">
      <h1><Icon name="store" size={22} /> Muebles en venta ({productos.length})</h1>
      <button class="btn verde" on:click={abrirNuevo}>+ Publicar mueble</button>
    </div>
    {#if productos.length === 0}
      <section class="card"><p class="big center gris-texto">Todavía no hay muebles publicados.</p></section>
    {:else}
      <div class="mk-grid">
        {#each productos as p (p.id)}
          <section class="card mk-card">
            {#if p.imageUrl}<img src={p.imageUrl} alt={p.name} class="mk-img" />{/if}
            <h2>{p.name}</h2>
            <p class="gris-texto">{p.category} · madera {p.woodType} · {p.dimensions}</p>
            <p class="mk-precio">Bs {p.price}
              <span class="urgencia" class:ok={p.stock > 0} class:rojo={p.stock <= 0}>
                {p.stock > 0 ? `${p.stock} disponibles` : 'Agotado'}
              </span>
            </p>
            {#if p.carpenterName}<p class="gris-texto">Publicado por {p.carpenterName}</p>{/if}
            <div class="modal-btns">
              <button class="btn" on:click={() => abrirEditar(p)}>Editar / Stock</button>
              <button class="btn gris" on:click={() => pedirEliminar(p)}>Eliminar</button>
            </div>
          </section>
        {/each}
      </div>
    {/if}
  {:else if cargando}
    <p class="big center gris-texto">Cargando tus trabajos…</p>
  {:else if error}
    <section class="card">
      <p class="big">{error}</p>
      <button class="btn grande" on:click={() => cargar()}>Reintentar</button>
    </section>
  {:else}
    {#if aviso}<p class="aviso"><Icon name="check-circle" size={20} /> {aviso}</p>{/if}

    <!-- ══ TU SIGUIENTE PASO (héroe predictivo) ══ -->
    {@const accion = siguienteAccion()}
    {@const activosN = activos().length}
    {@const pendientesN = totalPendientes()}
    {@const proximas = entregasProximas()}

    <section class="hero">
      {#if accion}
        <p class="hero-label"><Icon name="flag" size={16} /> Lo siguiente que tienes que hacer</p>
        <p class="hero-paso">{accion.paso.name}</p>
        <p class="hero-trabajo">del trabajo «{accion.order.description || 'sin nombre'}» para {accion.order.client?.name}</p>
        <button class="btn hero-btn" class:naranja={accion.paso.status === 'PENDING'} class:verde={accion.paso.status === 'IN_PROGRESS'}
          on:click={() => pedirConfirmacionPaso(accion.paso)}>
          {#if accion.paso.status === 'PENDING'}<Icon name="play" size={20} /> Empezar ahora{:else}<Icon name="check" size={20} /> Ya lo terminé{/if}
        </button>
      {:else if activosN === 0}
        <p class="hero-label"><Icon name="check-circle" size={16} /> Todo en orden</p>
        <p class="hero-paso">No tienes trabajos pendientes</p>
        <p class="hero-trabajo">Cuando te asignen uno, aparecerá aquí.</p>
      {:else}
        <p class="hero-label"><Icon name="check-circle" size={16} /> Todo terminado</p>
        <p class="hero-paso">Completaste todos los pasos</p>
        <p class="hero-trabajo">Espera a que el encargado revise el trabajo.</p>
      {/if}
      <p class="hero-resumen">
        {activosN} trabajo{activosN === 1 ? '' : 's'} activo{activosN === 1 ? '' : 's'}
        {#if pendientesN > 0} · {pendientesN} paso{pendientesN === 1 ? '' : 's'} por hacer{/if}
        {#if proximas.length > 0} · próxima entrega {fechaBonita(proximas[0].delivery.scheduledDate)}{/if}
      </p>
    </section>

    <div class="cols">
    <div class="col-principal">
    <!-- ══ MIS TRABAJOS ══ -->
    <h1><Icon name="clipboard" size={22} /> Mis trabajos</h1>
    {#if orders.length === 0}
      <section class="card"><p class="big center gris-texto">No tienes trabajos asignados ahora mismo.</p></section>
    {:else}
      {#each orders as o (o.id)}
        {@const pasos = pasosOrdenados(o)}
        {@const sig = siguientePaso(o)}
        {@const urg = urgencia(o)}
        <section class="card trabajo" class:terminado-card={trabajoTerminado(o)}>
          <div class="trabajo-top">
            <h2>{o.description || 'Trabajo sin nombre'}</h2>
            {#if urg}<span class="urgencia {urg.nivel}">{#if urg.nivel === 'rojo'}<Icon name="alert" size={14} />{:else}<Icon name="clock" size={14} />{/if} {urg.texto}</span>{/if}
          </div>
          <p class="para"><Icon name="user" size={14} /> Para: <b>{o.client?.name ?? '—'}</b></p>

          {#if o.items?.length}
            <ul class="hacer">
              {#each o.items as it}
                <li>
                  <b>{it.quantity}×</b> {it.description || FURNITURE[it.furnitureType] || 'pieza'}
                  {#if it.woodType}<span class="madera">· madera {WOOD[it.woodType] ?? it.woodType}</span>{/if}
                </li>
              {/each}
            </ul>
          {/if}

          {#if fechaEntrega(o)}
            <p class="fecha"><Icon name="calendar" size={15} /> Entregar el <b>{fechaBonita(fechaEntrega(o))}</b></p>
          {/if}

          {#if pasos.length}
            <div class="progreso">
              <div class="barra"><div class="relleno" style="width:{progreso(o)}%"></div></div>
              <p>{pasosHechos(o)} de {pasos.length} pasos listos</p>
            </div>

            <ol class="pasos">
              {#each pasos as p, i (p.id)}
                <li class:hecho={p.status === 'COMPLETED'} class:curso={p.status === 'IN_PROGRESS'}>
                  <span class="num" class:num-ok={p.status === 'COMPLETED'} class:num-curso={p.status === 'IN_PROGRESS'}>
                    {#if p.status === 'COMPLETED'}<Icon name="check" size={14} />{:else}{i + 1}{/if}
                  </span>
                  <span class="pname">{p.name}</span>
                  {#if p.id === sig?.id}
                    {#if p.status === 'PENDING'}
                      <button class="btn naranja" on:click={() => pedirConfirmacionPaso(p)}><Icon name="play" size={16} /> Empezar</button>
                    {:else}
                      <button class="btn verde" on:click={() => pedirConfirmacionPaso(p)}><Icon name="check" size={16} /> Ya terminé</button>
                    {/if}
                  {/if}
                </li>
              {/each}
            </ol>
            {#if !sig}
              <p class="terminado"><Icon name="check-circle" size={18} /> ¡Trabajo terminado! Avisa al encargado.</p>
            {/if}
          {:else}
            <p class="hint">Este trabajo aún no tiene pasos definidos.</p>
          {/if}
        </section>
      {/each}
    {/if}

    </div>
    <aside class="col-lado">
    <!-- ══ MIS ENTREGAS ══ -->
    <h1><Icon name="truck" size={22} /> Próximas entregas</h1>
    {#if proximas.length === 0}
      <section class="card"><p class="big center gris-texto">No tienes entregas programadas.</p></section>
    {:else}
      {#each proximas as o (o.id)}
        <section class="card entrega">
          <div class="entrega-top">
            <p class="edia"><Icon name="calendar" size={17} /> <b>{fechaBonita(o.delivery.scheduledDate)}</b> — {SLOT[o.delivery.timeSlot] ?? ''}</p>
            {#if o.d !== null}
              <span class="urgencia" class:rojo={o.d <= 1} class:ambar={o.d > 1 && o.d <= 3} class:ok={o.d > 3}>
                {o.d < 0 ? 'Pasada' : o.d === 0 ? 'Hoy' : o.d === 1 ? 'Mañana' : `En ${o.d} días`}
              </span>
            {/if}
          </div>
          <p>Llevar: <b>{o.description || 'pedido'}</b> de {o.client?.name ?? 'el cliente'}</p>
          {#if (o.delivery.deliveryType ?? o.deliveryType) === 'PICKUP'}
            <p class="dir"><Icon name="store" size={14} /> <b>El cliente recoge en el taller</b> — no hay que llevar nada.</p>
          {:else}
            {#if o.delivery.address ?? o.deliveryAddress}
              <p class="dir"><Icon name="pin" size={14} /> {o.delivery.address ?? o.deliveryAddress}</p>
            {/if}
            {@const lat = o.delivery.latitude ?? o.deliveryLat}
            {@const lng = o.delivery.longitude ?? o.deliveryLng}
            {#if lat && lng}
              <a class="maps-btn" target="_blank" rel="noopener"
                 href="https://www.google.com/maps?q={lat},{lng}">
                <Icon name="navigation" size={16} /> Abrir ubicación en Maps
              </a>
            {/if}
          {/if}
          <span class="badge">{DELIVERY_STATUS[o.delivery.status] ?? o.delivery.status}</span>
        </section>
      {/each}
    {/if}

    </aside>
    </div>
  {/if}
</main>
{/if}

<!-- ══ ASISTENTE FLOTANTE ══ -->
{#if !denied && !cargando}
  {#if !chatAbierto}
    <button class="fab" on:click={() => (chatAbierto = true)} aria-label="Asistente">
      <Icon name="chat" size={26} /><span class="fab-label">Ayuda</span>
    </button>
  {:else}
    <div class="chat-fondo" role="presentation" on:click={() => (chatAbierto = false)}></div>
    <aside class="panel" role="dialog" aria-label="Asistente del taller">
      <div class="panel-top">
        <div class="panel-title">
          <span class="panel-ico"><Icon name="chat" size={18} /></span>
          <div><b>Asistente del taller</b><p class="panel-sub">Pregúntame lo que necesites</p></div>
        </div>
        <button class="panel-cerrar" on:click={() => (chatAbierto = false)} aria-label="Cerrar">✕</button>
      </div>

      <div class="chips">
        {#each PREGUNTAS as q}
          <button class="chip" on:click={() => ask(q)} disabled={agentLoading}>{q}</button>
        {/each}
      </div>

      <div class="chat" bind:this={chatBox}>
        {#each agentMsgs as m}
          <div class="bubble" class:bubble-user={m.role === 'user'} class:bubble-agent={m.role === 'agent'}>{m.text}</div>
        {/each}
        {#if agentLoading}<div class="bubble bubble-agent" style="opacity:.6">Pensando…</div>{/if}
      </div>

      <div class="row panel-input">
        <input type="text" bind:value={agentQuery} placeholder="Escribe tu duda aquí…"
          on:keydown={(e) => e.key === 'Enter' && ask()} />
        <button class="btn" on:click={() => ask()} disabled={agentLoading}>{agentLoading ? '…' : 'Preguntar'}</button>
      </div>
    </aside>
  {/if}
{/if}

<!-- Formulario de mueble del Marketplace (foto → AWS S3) -->
{#if prodModal}
  <div class="fondo" role="presentation" on:click|self={() => (prodModal = false)}>
    <form class="modal mk-form" on:submit|preventDefault={guardarProducto}>
      <p class="big"><b>{prodEditando ? 'Editar mueble' : 'Publicar mueble'}</b></p>
      <label>Nombre<input bind:value={prodForm.name} required /></label>
      <div class="row">
        <label>Categoría<select bind:value={prodForm.category}>{#each CATEGORIAS as c}<option>{c}</option>{/each}</select></label>
        <label>Madera<select bind:value={prodForm.woodType}>{#each MADERAS as m}<option>{m}</option>{/each}</select></label>
      </div>
      <label>Medidas<input bind:value={prodForm.dimensions} required /></label>
      <div class="row">
        <label>Precio Bs<input type="number" min="1" bind:value={prodForm.price} required /></label>
        <label>Stock<input type="number" min="0" bind:value={prodForm.stock} required /></label>
        <label>Días<input type="number" min="1" bind:value={prodForm.estimatedDays} /></label>
      </div>
      <label>Descripción<textarea rows="3" bind:value={prodForm.description} required></textarea></label>
      <label>Foto (se sube al bucket S3)
        <input type="file" accept="image/*" on:change={(e) => (prodFoto = e.currentTarget.files?.[0] ?? null)} />
      </label>
      {#if prodError}<p style="color:#C0392B">{prodError}</p>{/if}
      <div class="modal-btns">
        <button type="button" class="btn gris" on:click={() => (prodModal = false)}>Cancelar</button>
        <button type="submit" class="btn verde" disabled={prodGuardando}>{prodGuardando ? 'Guardando…' : 'Guardar'}</button>
      </div>
    </form>
  </div>
{/if}

<!-- Confirmación grande y simple -->
{#if confirmacion}
  <div class="fondo" role="dialog" aria-modal="true" on:click={() => (confirmacion = null)}>
    <div class="modal">
      <p class="big center">{confirmacion.texto}</p>
      <div class="modal-btns">
        <button class="btn gris" on:click={() => (confirmacion = null)}>Todavía no</button>
        <button class="btn verde" on:click={confirmar}><Icon name="check" size={18} /> Sí</button>
      </div>
    </div>
  </div>
{/if}

<style>
  :global(html), :global(body) { margin: 0; padding: 0; }
  .topbar { display: flex; justify-content: space-between; align-items: center; background: #3B2F2F; color: #FAF7F2; padding: 0 24px; height: 64px; font-family: Inter, system-ui, sans-serif; position: sticky; top: 0; z-index: 70; }
  .brand { display: flex; align-items: center; gap: 10px; font-size: 20px; color: #D4A574; }
  .brand strong { color: #FAF7F2; }
  .who { display: flex; align-items: center; gap: 14px; }
  .hola { font-size: 15px; color: #E8C9A0; }
  .out { display: inline-flex; align-items: center; gap: 6px; background: #8B5A2B; color: #fff; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; font-size: 15px; }

  main { max-width: 1200px; margin: 0 auto; padding: 20px 24px 48px; font-family: Inter, system-ui, sans-serif; transition: padding-right .25s ease-out; }
  main.con-chat { padding-right: 424px; max-width: none; }
  .cols { display: grid; grid-template-columns: 1.6fr 1fr; gap: 8px 28px; align-items: start; }
  .col-principal, .col-lado { min-width: 0; }
  h1 { display: flex; align-items: center; gap: 10px; font-size: 21px; color: #3B2F2F; margin: 26px 0 14px; }
  h1:first-child { margin-top: 4px; }
  h1 :global(svg) { color: #8B5A2B; }
  h2 { margin: 0; font-size: 19px; color: #3B2F2F; }
  .big { font-size: 17px; }
  .center { text-align: center; }
  .gris-texto { color: #8a7f75; }
  .card { background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,.08); margin-bottom: 14px; }

  /* Héroe predictivo */
  .hero { background: linear-gradient(135deg, #3B2F2F 0%, #5C4033 100%); color: #FAF7F2; border-radius: 16px; padding: 24px; margin-bottom: 8px; }
  .hero-label { display: flex; align-items: center; gap: 8px; margin: 0 0 10px; font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: #D4A574; font-weight: 700; }
  .hero-paso { margin: 0; font-size: 26px; font-weight: 800; line-height: 1.2; }
  .hero-trabajo { margin: 6px 0 18px; font-size: 15px; color: #E8C9A0; }
  .hero-btn { display: inline-flex; align-items: center; gap: 10px; min-height: 56px; padding: 14px 28px; font-size: 18px; }
  .hero-resumen { margin: 18px 0 0; padding-top: 14px; border-top: 1px solid rgba(255,255,255,.18); font-size: 14px; color: #C9B8A8; }

  .aviso { display: flex; align-items: center; justify-content: center; gap: 10px; background: #E8F7EE; border: 2px solid #27AE60; color: #1E7B45; border-radius: 12px; padding: 14px 18px; font-size: 17px; font-weight: 600; text-align: center; }

  .trabajo-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .terminado-card { border: 2px solid #27AE60; }

  .urgencia { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; }
  .urgencia.rojo { background: #FDECEA; color: #C0392B; }
  .urgencia.ambar { background: #FDF3E3; color: #B4690E; }
  .urgencia.ok { background: #EAF4EC; color: #1E7B45; }

  .para { display: flex; align-items: center; gap: 6px; color: #555; margin: 6px 0; }
  .hacer { margin: 10px 0; padding-left: 0; list-style: none; }
  .hacer li { padding: 6px 0; font-size: 16px; border-bottom: 1px dashed #EDE4D8; }
  .madera { color: #8a7f75; }
  .fecha { display: flex; align-items: center; gap: 7px; color: #6B4F2E; font-size: 15px; }

  .progreso { margin: 14px 0 6px; }
  .progreso p { margin: 6px 0 0; font-size: 14px; color: #6B4F2E; }
  .barra { height: 14px; background: #EDE4D8; border-radius: 999px; overflow: hidden; }
  .relleno { height: 100%; background: #8B5A2B; border-radius: 999px; transition: width .4s; }

  .pasos { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; counter-reset: paso; }
  .pasos li { display: flex; align-items: center; gap: 12px; background: #FAF7F2; border: 1.5px solid #EDE4D8; border-radius: 12px; padding: 14px 16px; font-size: 17px; }
  .pasos li.hecho { opacity: .6; }
  .pasos li.curso { border-color: #E67E22; background: #FFF8F0; }
  .num { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; background: #EDE4D8; color: #6B4F2E; font-weight: 800; font-size: 14px; flex-shrink: 0; }
  .num-ok { background: #27AE60; color: #fff; }
  .num-curso { background: #E67E22; color: #fff; }
  .pname { flex: 1; }
  .terminado { display: flex; align-items: center; justify-content: center; gap: 8px; background: #E8F7EE; border-radius: 12px; padding: 14px; text-align: center; font-size: 17px; font-weight: 600; color: #1E7B45; margin-top: 14px; }
  .hint { color: #8a7f75; font-style: italic; }

  .entrega-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; }
  .entrega p { margin: 4px 0; font-size: 16px; }
  .entrega .edia { display: flex; align-items: center; gap: 8px; font-size: 18px; }
  .entrega .dir { display: flex; align-items: center; gap: 6px; color: #555; }
  .maps-btn { display: inline-flex; align-items: center; gap: 8px; margin: 6px 0 10px; padding: 12px 18px; border-radius: 12px; background: #1a5276; color: #fff; font-weight: 700; font-size: 15px; text-decoration: none; }
  .badge { display: inline-block; margin-top: 8px; background: #EDE4D8; color: #6B4F2E; padding: 5px 12px; border-radius: 999px; font-size: 14px; font-weight: 600; }

  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 10px; border: none; font-size: 16px; font-weight: 600; cursor: pointer; background: #8B5A2B; color: #fff; }
  .btn:disabled { opacity: .5; cursor: default; }
  .btn.verde { background: #27AE60; min-height: 52px; }
  .btn.naranja { background: #E67E22; min-height: 52px; }
  .btn.gris { background: #9a9087; min-height: 52px; }
  .btn.grande { width: 100%; min-height: 56px; justify-content: center; }

  .chips { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-bottom: 4px; }
  .chip { background: #fff; border: 1.5px solid #D4A574; color: #6B4F2E; border-radius: 999px; padding: 10px 16px; font-size: 15px; cursor: pointer; text-align: left; }
  .chip:disabled { opacity: .5; }

  /* ══ Botón flotante + panel asistente ══ */
  .fab { position: fixed; right: 22px; bottom: calc(22px + env(safe-area-inset-bottom, 0px)); z-index: 60; display: inline-flex; align-items: center; gap: 8px; height: 60px; min-width: 60px; padding: 0 20px; border-radius: 999px; border: none; background: #8B5A2B; color: #FAF7F2; font-size: 17px; font-weight: 700; cursor: pointer; box-shadow: 0 6px 18px rgba(59,47,47,.4); transition: background .2s, transform .15s; }
  .fab:hover { background: #6B4F2E; transform: translateY(-2px); }
  .chat-fondo { position: fixed; inset: 0; background: rgba(0,0,0,.3); z-index: 55; display: none; }
  .panel { position: fixed; top: 64px; right: 0; height: calc(100dvh - 64px); width: min(400px, 92vw); box-sizing: border-box; background: #FAF7F2; z-index: 56; display: flex; flex-direction: column; padding: 16px; border-left: 1px solid #EDE4D8; animation: entrar .25s ease-out; overflow: hidden; }
  @keyframes entrar { from { transform: translateX(60px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .panel-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-shrink: 0; }
  .panel-title { display: flex; align-items: center; gap: 10px; color: #3B2F2F; font-size: 17px; }
  .panel-ico { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 12px; background: #8B5A2B; color: #FAF7F2; }
  .panel-sub { margin: 2px 0 0; font-size: 12px; color: #8a7f75; font-weight: 400; }
  .panel-cerrar { border: none; background: #EDE4D8; color: #3B2F2F; width: 38px; height: 38px; border-radius: 50%; font-size: 16px; cursor: pointer; }
  .panel .chips { flex-shrink: 0; }
  .panel .chat { flex: 1 1 auto; min-height: 0; max-height: none; margin: 10px 0; }
  .panel-input { flex-shrink: 0; padding-top: 10px; border-top: 1px solid #EDE4D8; padding-bottom: env(safe-area-inset-bottom, 0px); }
  .panel-input .btn { white-space: nowrap; }

  .chat { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; background: #F5F1EC; border-radius: 12px; padding: 12px; margin: 8px 0; }
  .bubble { max-width: 85%; padding: 12px 16px; border-radius: 14px; font-size: 16px; line-height: 1.45; white-space: pre-wrap; }
  .bubble-agent { background: #fff; color: #3B2F2F; align-self: flex-start; border: 1px solid #EDE4D8; }
  .bubble-user { background: #8B5A2B; color: #FAF7F2; align-self: flex-end; }
  .row { display: flex; gap: 8px; }
  input { padding: 14px 16px; border-radius: 10px; border: 1.5px solid #ddd; font-size: 16px; flex: 1; }

  .fondo { position: fixed; inset: 0; background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center; z-index: 50; padding: 16px; }
  .modal { background: #fff; border-radius: 16px; padding: 28px; max-width: 420px; width: 100%; box-sizing: border-box; box-shadow: 0 8px 30px rgba(0,0,0,.25); }
  .modal-btns { display: flex; gap: 12px; margin-top: 22px; }
  .modal-btns .btn { flex: 1; justify-content: center; }

  button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }

  /* ══ Pestañas + Marketplace ══ */
  .tabs { display: flex; gap: 8px; margin-bottom: 14px; }
  .tab { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border-radius: 12px; border: 1.5px solid #EDE4D8; background: #fff; color: #6B4F2E; font-size: 16px; font-weight: 700; cursor: pointer; }
  .tab-on { background: #8B5A2B; color: #fff; border-color: #8B5A2B; }
  .mk-head { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
  .mk-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }
  .mk-img { width: 100%; aspect-ratio: 8/5; object-fit: cover; border-radius: 10px; margin-bottom: 10px; }
  .mk-card p { margin: 4px 0; }
  .mk-precio { display: flex; justify-content: space-between; align-items: center; font-size: 19px; font-weight: 800; color: #8B5A2B; }
  .mk-form { max-width: 520px; max-height: 92vh; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
  .mk-form label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; font-weight: 600; color: #3B2F2F; flex: 1; }
  .mk-form select, .mk-form textarea { padding: 12px; border-radius: 10px; border: 1.5px solid #ddd; font-size: 15px; font-family: inherit; }

  /* ══ Tablet ══ */
  @media (max-width: 940px) {
    .cols { grid-template-columns: 1fr; }
    main { max-width: 720px; padding: 16px 16px 40px; }
    main.con-chat { padding-right: 16px; }
    .chat-fondo { display: block; }
  }

  /* Con el chat abierto en pantallas medianas, las columnas se apilan */
  @media (max-width: 1300px) {
    main.con-chat .cols { grid-template-columns: 1fr; }
  }

  /* ══ Móvil — sensación de app nativa ══ */
  @media (max-width: 640px) {
    .topbar { height: 56px; padding: 0 14px; }
    .panel { top: 56px; height: calc(100dvh - 56px); width: 100vw; }
    .fab { right: 14px; bottom: calc(14px + env(safe-area-inset-bottom, 0px)); height: 56px; padding: 0 18px; }
    .brand { font-size: 18px; }
    .hola { font-size: 14px; }
    main { padding: 12px 12px calc(32px + env(safe-area-inset-bottom, 0px)); }
    h1 { font-size: 18px; margin: 22px 0 10px; }
    h2 { font-size: 17px; }
    .card { padding: 16px; border-radius: 12px; }
    .hero { padding: 18px; border-radius: 14px; }
    .hero-paso { font-size: 22px; }
    .hero-btn { width: 100%; justify-content: center; }
    .trabajo-top { flex-direction: column; align-items: flex-start; }
    .pasos li { flex-wrap: wrap; padding: 12px; }
    .pasos .btn { flex: 1 0 100%; justify-content: center; margin-top: 4px; }
    .entrega-top { flex-direction: column; align-items: flex-start; }
    .modal { padding: 22px; }
    .modal-btns { flex-direction: column-reverse; }
    .modal-btns .btn { width: 100%; min-height: 56px; }
    .row { flex-direction: column; }
    .row .btn { min-height: 52px; justify-content: center; }
    /* La barra de consulta del asistente se mantiene en una sola línea compacta */
    .panel .panel-input { flex-direction: row; align-items: center; }
    .panel-input .btn { min-height: 0; padding: 13px 18px; font-size: 15px; }
    .panel-input input { padding: 12px 14px; }
    .panel { padding: 14px 12px; }
    .chips .chip { font-size: 14px; padding: 8px 14px; }
  }
</style>
