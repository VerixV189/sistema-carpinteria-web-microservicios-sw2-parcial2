package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.delivery.model.DeliveryType;
import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.valueobject.OrderId;
import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class OrderJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "client_id", nullable = false)
    private long clientId;

    @Column(name = "quotation_id")
    private String quotationId;

    private String description;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "total_price")
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @Column(name = "delivery_type")
    private String deliveryType = "DELIVERY";

    @Column(name = "delivery_address")
    private String deliveryAddress;

    @Column(name = "delivery_lat")
    private Double deliveryLat;

    @Column(name = "delivery_lng")
    private Double deliveryLng;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItemJpaEntity> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sequence ASC")
    private List<ProductionStepJpaEntity> steps = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "order_carpenters", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "carpenter_id")
    private Set<Long> carpenterIds = new HashSet<>();

    public Order toDomain() {
        Order domain = new Order(
                id != null ? new OrderId(id) : null,
                clientId,
                quotationId,
                description,
                OrderStatus.valueOf(status),
                items.stream().map(OrderItemJpaEntity::toDomain).toList(),
                steps.stream().map(ProductionStepJpaEntity::toDomain).toList(),
                new HashSet<>(carpenterIds),
                deliveryDate,
                createdAt,
                updatedAt);
        domain.setDeliveryType(DeliveryType.of(deliveryType));
        domain.setDeliveryAddress(deliveryAddress);
        domain.setDeliveryLat(deliveryLat);
        domain.setDeliveryLng(deliveryLng);
        return domain;
    }

    public static OrderJpaEntity from(Order o) {
        OrderJpaEntity e = new OrderJpaEntity();
        e.id = o.getId() != null ? o.getId().value() : null;
        e.clientId = o.getClientId();
        e.quotationId = o.getQuotationId();
        e.description = o.getDescription();
        e.status = o.getStatus().name();
        e.totalPrice = o.getTotalPrice().amount();
        e.deliveryDate = o.getDeliveryDate();
        e.createdAt = o.getCreatedAt();
        e.updatedAt = o.getUpdatedAt();
        e.items = new ArrayList<>(o.getItems().stream().map(i -> {
            OrderItemJpaEntity item = OrderItemJpaEntity.from(i);
            item.setOrder(e);
            return item;
        }).toList());
        e.steps = new ArrayList<>(o.getSteps().stream().map(s -> {
            ProductionStepJpaEntity step = ProductionStepJpaEntity.from(s);
            step.setOrder(e);
            return step;
        }).toList());
        e.carpenterIds = new HashSet<>(o.getCarpenterIds());
        e.deliveryType = o.getDeliveryType() != null ? o.getDeliveryType().name() : "DELIVERY";
        e.deliveryAddress = o.getDeliveryAddress();
        e.deliveryLat = o.getDeliveryLat();
        e.deliveryLng = o.getDeliveryLng();
        return e;
    }
}
