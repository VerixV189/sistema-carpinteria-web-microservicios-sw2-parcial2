const HOST = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const GATEWAY = `http://${HOST}:3000/api`;
const AI = `http://${HOST}:3000/api/ai`;
const GRAPHQL = `http://${HOST}:3000/graphql`;

function headers() {
  const token = localStorage.getItem('carpinteria_token')
    ?? (() => { try { return JSON.parse(localStorage.getItem('carpinteria_session') ?? '{}').token; } catch { return null; } })();
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function gql(query: string, variables: Record<string, unknown> = {}) {
  const r = await fetch(GRAPHQL, { method: 'POST', headers: headers(), body: JSON.stringify({ query, variables }) });
  return r.json();
}

export async function checkDeliveryDate(date: string) {
  const r = await fetch(`${AI}/delivery/check?date=${encodeURIComponent(date)}`, { headers: headers() });
  return r.json();
}

export async function scheduleDelivery(orderId: number, date: string) {
  const json = await gql(
    'mutation($input: ScheduleDeliveryInput!) { scheduleDelivery(input: $input) { id scheduledDate status } }',
    { input: { orderId: String(orderId), scheduledDate: date, timeSlot: 'MORNING' } },
  );
  return json.data?.scheduleDelivery ?? { error: json.errors?.[0]?.message };
}

export async function listDeliveries() {
  const json = await gql('{ deliveries { id orderId scheduledDate status timeSlot address deliveryType latitude longitude } }');
  return json.data?.deliveries ?? [];
}

/** Ficha del carpintero según el email de la sesión. */
export async function findMyCarpenter(email: string): Promise<{ id: string; name: string } | null> {
  const json = await gql('{ carpenters { id name email } }');
  const me = (json.data?.carpenters ?? []).find(
    (c: any) => c.email?.toLowerCase() === email.toLowerCase(),
  );
  return me ? { id: me.id, name: me.name } : null;
}

/** Mis pedidos asignados con ítems, pasos de producción y entrega. */
export async function myOrders(carpenterId: string) {
  const json = await gql(
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
    { id: carpenterId },
  );
  return (json.data?.carpenterWorkload ?? []) as any[];
}

/** Marcar un paso como empezado o terminado. */
export async function updateStep(stepId: string, status: 'IN_PROGRESS' | 'COMPLETED') {
  const json = await gql(
    'mutation($id: ID!, $status: StepStatus!) { updateStepStatus(stepId: $id, status: $status) { id status } }',
    { id: stepId, status },
  );
  return json.data?.updateStepStatus ?? { error: json.errors?.[0]?.message };
}

export async function askAgent(query: string) {
  const sessionId = localStorage.getItem('agent_session') ??
    (() => { const id = crypto.randomUUID(); localStorage.setItem('agent_session', id); return id; })();
  const r = await fetch(`${AI}/agent`, {
    method: 'POST', headers: headers(),
    body: JSON.stringify({ query, session_id: sessionId }),
  });
  return r.json();
}
