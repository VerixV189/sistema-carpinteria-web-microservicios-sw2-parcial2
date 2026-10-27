package com.carpinteria.business.domain.order.model;

import com.carpinteria.business.domain.delivery.model.DeliveryType;
import com.carpinteria.business.domain.order.valueobject.Money;
import com.carpinteria.business.domain.order.valueobject.OrderId;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

/** Aggregate Root — Pedido. */
@Getter
public class Order {

    private final OrderId id;
    private final long clientId;
    private final Instant createdAt;
    @Setter private String quotationId;
    @Setter private String description;
    @Setter private OrderStatus status;
    @Setter private List<OrderItem> items;
    @Setter private List<ProductionStep> steps;
    @Setter private Set<Long> carpenterIds;
    @Setter private LocalDate deliveryDate;
    @Setter private Instant updatedAt;
    // Modalidad de entrega elegida por el cliente (recojo en taller o envío con GPS)
    @Setter private DeliveryType deliveryType;
    @Setter private String deliveryAddress;
    @Setter private Double deliveryLat;
    @Setter private Double deliveryLng;

    public Order(OrderId id, long clientId, String quotationId, String description, OrderStatus status,
                 List<OrderItem> items, List<ProductionStep> steps, Set<Long> carpenterIds,
                 LocalDate deliveryDate, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.clientId = clientId;
        this.quotationId = quotationId;
        this.description = description;
        this.status = status != null ? status : OrderStatus.PENDING;
        this.items = items != null ? new ArrayList<>(items) : new ArrayList<>();
        this.steps = steps != null ? new ArrayList<>(steps) : new ArrayList<>();
        this.carpenterIds = carpenterIds != null ? new HashSet<>(carpenterIds) : new HashSet<>();
        this.deliveryDate = deliveryDate;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
        this.deliveryType = DeliveryType.DELIVERY;
    }

    public Order(long clientId) {
        this(null, clientId, null, null, null, null, null, null, null, null, null);
    }

    public Money getTotalPrice() {
        BigDecimal total = items.stream()
                .map(i -> i.getUnitPrice().amount().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Money(total, "BOB");
    }

    public void changeStatus(OrderStatus next) {
        if (!status.canTransitionTo(next)) {
            throw new IllegalArgumentException("Transición " + status + " → " + next + " inválida");
        }
        this.status = next;
        this.updatedAt = Instant.now();
    }

    public void assignCarpenter(long carpenterId) {
        carpenterIds.add(carpenterId);
        this.updatedAt = Instant.now();
    }

    public void linkQuotation(String quotationId) {
        this.quotationId = quotationId;
        if (status == OrderStatus.PENDING) status = OrderStatus.APPROVED;
        this.updatedAt = Instant.now();
    }
}
