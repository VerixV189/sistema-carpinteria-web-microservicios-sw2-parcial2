import { gql } from 'apollo-angular';

// ─── Clientes (CU1) ──────────────────────────────────────────────────────────
export const CLIENTS = gql`
  query Clients { clients { id name email phone address segment } }
`;
export const CREATE_CLIENT = gql`
  mutation CreateClient($input: CreateClientInput!) {
    createClient(input: $input) { id name email }
  }
`;
export const UPDATE_CLIENT = gql`
  mutation UpdateClient($id: ID!, $input: UpdateClientInput!) {
    updateClient(id: $id, input: $input) { id name email segment }
  }
`;
export const DELETE_CLIENT = gql`
  mutation DeleteClient($id: ID!) { deleteClient(id: $id) }
`;

// ─── Carpinteros (CU2) ───────────────────────────────────────────────────────
export const CARPENTERS = gql`
  query Carpenters {
    carpenters { id name email phone specialty yearsExperience hourlyRate active }
  }
`;
export const CREATE_CARPENTER = gql`
  mutation CreateCarpenter($input: CreateCarpenterInput!) {
    createCarpenter(input: $input) { id name }
  }
`;
export const UPDATE_CARPENTER = gql`
  mutation UpdateCarpenter($id: ID!, $input: UpdateCarpenterInput!) {
    updateCarpenter(id: $id, input: $input) { id name active }
  }
`;
export const DELETE_CARPENTER = gql`
  mutation DeleteCarpenter($id: ID!) { deleteCarpenter(id: $id) }
`;
export const CARPENTER_WORKLOAD = gql`
  query CarpenterWorkload($carpenterId: ID!) {
    carpenterWorkload(carpenterId: $carpenterId) { id description status deliveryDate }
  }
`;

// ─── Pedidos ─────────────────────────────────────────────────────────────────
export const ORDERS = gql`
  query Orders($status: OrderStatus) {
    orders(status: $status) {
      id description status totalPrice deliveryDate createdAt
      client { id name }
      items { id description furnitureType woodType quantity unitPrice }
      steps { id name status sequence }
      carpenters { id name }
      delivery { id scheduledDate timeSlot status address deliveryType latitude longitude }
      deliveryType deliveryAddress deliveryLat deliveryLng
    }
  }
`;
export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) { id status }
  }
`;
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) { id status }
  }
`;
export const ASSIGN_CARPENTER = gql`
  mutation AssignCarpenter($orderId: ID!, $carpenterId: ID!) {
    assignCarpenter(orderId: $orderId, carpenterId: $carpenterId) { id carpenters { id name } }
  }
`;
export const UPDATE_STEP_STATUS = gql`
  mutation UpdateStepStatus($stepId: ID!, $status: StepStatus!) {
    updateStepStatus(stepId: $stepId, status: $status) { id status }
  }
`;
export const LINK_QUOTATION = gql`
  mutation LinkQuotation($orderId: ID!, $quotationId: String!) {
    linkQuotation(orderId: $orderId, quotationId: $quotationId) { id quotationId }
  }
`;
export const ORDER_STATUS_CHANGED = gql`
  subscription OnOrderStatusChanged {
    orderStatusChanged { id status }
  }
`;

// ─── Entregas (CU4) ──────────────────────────────────────────────────────────
export const DELIVERIES = gql`
  query Deliveries($from: String, $to: String) {
    deliveries(from: $from, to: $to) { id orderId scheduledDate timeSlot address status notes deliveryType latitude longitude }
  }
`;
export const DELIVERY_CAPACITY = gql`
  query DeliveryCapacity($date: String!) { deliveryCapacity(date: $date) }
`;
export const SCHEDULE_DELIVERY = gql`
  mutation ScheduleDelivery($input: ScheduleDeliveryInput!) {
    scheduleDelivery(input: $input) { id orderId scheduledDate status deliveryType address }
  }
`;
export const UPDATE_DELIVERY_STATUS = gql`
  mutation UpdateDeliveryStatus($id: ID!, $status: DeliveryStatus!) {
    updateDeliveryStatus(id: $id, status: $status) { id status }
  }
`;
export const RESCHEDULE_DELIVERY = gql`
  mutation RescheduleDelivery($id: ID!, $newDate: String!) {
    rescheduleDelivery(id: $id, newDate: $newDate) { id scheduledDate status }
  }
`;
