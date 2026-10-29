package com.carpinteria.business.infrastructure.messaging;

import com.carpinteria.business.application.order.CreateOrderUseCase;
import com.carpinteria.business.application.order.UpdateOrderStatusUseCase;
import com.carpinteria.business.application.order.dto.CreateOrderCommand;
import com.carpinteria.business.application.order.dto.DimensionsCommand;
import com.carpinteria.business.application.order.dto.OrderItemCommand;
import com.carpinteria.business.application.order.dto.OrderResponse;
import com.carpinteria.business.domain.carpenter.model.Carpenter;
import com.carpinteria.business.domain.carpenter.repository.CarpenterRepository;
import com.carpinteria.business.domain.client.model.Client;
import com.carpinteria.business.domain.client.model.ContactInfo;
import com.carpinteria.business.domain.client.repository.ClientRepository;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumidores (doc §5.5):
 *  - quotation.approved → actualiza pedido vinculado (quotationId) o, si el
 *    cliente aceptó sin pedido previo (o compró en el Marketplace), CREA el
 *    pedido con ítems, la modalidad de entrega elegida y auto-asigna al
 *    carpintero si el mueble fue publicado por él.
 *  - payment.completed  → marca pedido listo para producción.
 */
@Component
public class DomainEventListener {

    private static final Logger log = LoggerFactory.getLogger(DomainEventListener.class);

    private final UpdateOrderStatusUseCase updateOrderStatus;
    private final CreateOrderUseCase createOrder;
    private final ClientRepository clientRepository;
    private final OrderRepository orderRepository;
    private final CarpenterRepository carpenterRepository;

    public DomainEventListener(UpdateOrderStatusUseCase updateOrderStatus,
                               CreateOrderUseCase createOrder,
                               ClientRepository clientRepository,
                               OrderRepository orderRepository,
                               CarpenterRepository carpenterRepository) {
        this.updateOrderStatus = updateOrderStatus;
        this.createOrder = createOrder;
        this.clientRepository = clientRepository;
        this.orderRepository = orderRepository;
        this.carpenterRepository = carpenterRepository;
    }

    @RabbitListener(queues = {"business.quotation_approved"})
    @SuppressWarnings("unchecked")
    public void onQuotationApproved(Map<String, Object> payload) {
        log.info("quotation.approved recibido: {}", payload);
        Object quotationId = payload.get("quotationId");
        if (quotationId == null) return;

        if (payload.get("orderId") instanceof Number orderId) {
            updateOrderStatus.linkQuotation(orderId.longValue(), quotationId.toString());
            return;
        }

        // Aceptación directa del cliente → crear pedido automáticamente.
        Long clientId = resolveClientId(payload.get("clientId"));
        if (clientId == null) {
            log.warn("quotation.approved: no se pudo resolver el cliente {}", payload.get("clientId"));
            return;
        }
        List<OrderItemCommand> items = ((List<Map<String, Object>>)
                payload.getOrDefault("items", List.of())).stream()
                .map(i -> {
                    Map<String, Object> d = (Map<String, Object>) i.get("dimensions");
                    return new OrderItemCommand(
                            (String) i.get("description"),
                            (String) i.get("furnitureType"),
                            (String) i.get("woodType"),
                            i.get("quantity") instanceof Number n ? n.intValue() : 1,
                            i.get("unitPrice") instanceof Number n ? n.doubleValue() : 0.0,
                            d != null ? new DimensionsCommand(
                                    ((Number) d.get("lengthM")).doubleValue(),
                                    ((Number) d.get("widthM")).doubleValue(),
                                    ((Number) d.get("heightM")).doubleValue()) : null);
                })
                .toList();
        Map<String, Object> delivery = (Map<String, Object>) payload.get("delivery");

        OrderResponse created = createOrder.execute(new CreateOrderCommand(
                clientId, quotationId.toString(),
                (String) payload.getOrDefault("description", "Pedido desde cotización aceptada"),
                items,
                delivery != null ? (String) delivery.get("type") : null,
                delivery != null ? (String) delivery.get("address") : null,
                delivery != null && delivery.get("lat") instanceof Number n ? n.doubleValue() : null,
                delivery != null && delivery.get("lng") instanceof Number n ? n.doubleValue() : null));
        // El cliente ya aceptó el precio → el pedido nace aprobado; pasa a
        // producción cuando se confirme el pago completo.
        updateOrderStatus.updateStatus(created.id(), OrderStatus.APPROVED);
        if (Boolean.TRUE.equals(payload.get("paid"))) {
            updateOrderStatus.updateStatus(created.id(), OrderStatus.IN_PRODUCTION);
        }
        Object carpenterEmailRaw = payload.get("carpenterEmail");
        if (carpenterEmailRaw instanceof String carpEmail && !carpEmail.isBlank()) {
            carpenterRepository.findAll().stream()
                    .filter(c -> c.getEmail() != null && c.getEmail().equalsIgnoreCase(carpEmail.trim()))
                    .findFirst()
                    .ifPresent(carpenter -> {
                        updateOrderStatus.assignCarpenter(created.id(), carpenter.getId());
                        log.info("Pedido #{} auto-asignado al carpintero {} (#{})",
                                created.id(), carpenter.getEmail(), carpenter.getId());
                    });
        }
        log.info("Pedido #{} creado y aprobado desde cotización/marketplace {}", created.id(), quotationId);
    }

    /**
     * El gateway identifica al cliente por email (sesión del portal) o por id
     * numérico. Si viene un email que aún no tiene ficha, se registra el
     * cliente automáticamente para no perder el pedido.
     */
    private Long resolveClientId(Object raw) {
        if (raw == null) return null;
        String value = String.valueOf(raw).trim();
        if (value.isEmpty()) return null;
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ignored) {
        }
        Optional<Client> existing = clientRepository.findByEmail(value);
        if (existing.isPresent()) return existing.get().getId();
        if (!value.contains("@")) return null;
        String local = value.split("@")[0].replaceAll("[._\\-]+", " ").trim();
        String name = local.isEmpty() ? "Cliente del portal"
                : Character.toUpperCase(local.charAt(0)) + local.substring(1);
        Client created = clientRepository.save(new Client(null, name,
                new ContactInfo(value, null, null), null, null, null));
        log.info("Cliente auto-registrado desde cotización aceptada: #{} {}", created.getId(), value);
        return created.getId();
    }

    @RabbitListener(queues = {"business.payment_completed"})
    public void onPaymentCompleted(Map<String, Object> payload) {
        log.info("payment.completed recibido: {}", payload);
        // Pago completo confirmado → el pedido entra a producción.
        Long orderId = payload.get("orderId") instanceof Number n ? n.longValue() : null;
        if (orderId == null && payload.get("quotationId") != null) {
            orderId = orderRepository.findByQuotationId(String.valueOf(payload.get("quotationId")))
                    .map(o -> o.getId().value())
                    .orElse(null);
        }
        if (orderId == null) return;
        var order = orderRepository.findById(orderId).orElse(null);
        if (order == null) {
            log.warn("payment.completed: pedido {} no existe", orderId);
            return;
        }
        // Si el pago llegó a un pedido aún pendiente, se aprueba primero
        // (el cliente aceptó la cotización antes de pagar).
        if (order.getStatus() == OrderStatus.PENDING) {
            updateOrderStatus.updateStatus(orderId, OrderStatus.APPROVED);
        }
        updateOrderStatus.updateStatus(orderId, OrderStatus.IN_PRODUCTION);
    }
}
