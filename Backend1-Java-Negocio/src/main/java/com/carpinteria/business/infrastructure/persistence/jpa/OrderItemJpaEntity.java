package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.order.model.OrderItem;
import com.carpinteria.business.domain.order.valueobject.Dimensions;
import com.carpinteria.business.domain.order.valueobject.Money;
import com.carpinteria.business.domain.order.valueobject.WoodType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItemJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Lado propietario — la FK order_id (NOT NULL) se escribe en el INSERT. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderJpaEntity order;

    private String description;

    @Column(name = "furniture_type")
    private String furnitureType;

    @Column(name = "wood_type")
    private String woodType;

    private int quantity = 1;

    @Column(name = "unit_price")
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "length_m")
    private BigDecimal lengthM;

    @Column(name = "width_m")
    private BigDecimal widthM;

    @Column(name = "height_m")
    private BigDecimal heightM;

    public OrderItem toDomain() {
        Dimensions dimensions = null;
        if (lengthM != null && widthM != null && heightM != null) {
            dimensions = new Dimensions(lengthM.doubleValue(), widthM.doubleValue(),
                    heightM.doubleValue());
        }
        return new OrderItem(id, description, furnitureType, WoodType.of(woodType),
                quantity, new Money(unitPrice), dimensions);
    }

    public static OrderItemJpaEntity from(OrderItem i) {
        OrderItemJpaEntity e = new OrderItemJpaEntity();
        e.id = i.getId();
        e.description = i.getDescription();
        e.furnitureType = i.getFurnitureType();
        e.woodType = i.getWoodType().name();
        e.quantity = i.getQuantity();
        e.unitPrice = i.getUnitPrice().amount();
        if (i.getDimensions() != null) {
            e.lengthM = BigDecimal.valueOf(i.getDimensions().lengthM());
            e.widthM = BigDecimal.valueOf(i.getDimensions().widthM());
            e.heightM = BigDecimal.valueOf(i.getDimensions().heightM());
        }
        return e;
    }
}
