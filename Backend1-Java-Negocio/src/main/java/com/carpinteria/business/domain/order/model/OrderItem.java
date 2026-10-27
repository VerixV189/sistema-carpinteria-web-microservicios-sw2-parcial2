package com.carpinteria.business.domain.order.model;

import com.carpinteria.business.domain.order.valueobject.Dimensions;
import com.carpinteria.business.domain.order.valueobject.Money;
import com.carpinteria.business.domain.order.valueobject.WoodType;
import lombok.Getter;

/** Entidad interna del agregado Order — ítem de pedido. */
@Getter
public class OrderItem {

    private final Long id;
    private final String description;
    private final String furnitureType;
    private final WoodType woodType;
    private final int quantity;
    private final Money unitPrice;
    private final Dimensions dimensions;

    public OrderItem(Long id, String description, String furnitureType, WoodType woodType,
                     int quantity, Money unitPrice, Dimensions dimensions) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser positiva");
        }
        this.id = id;
        this.description = description;
        this.furnitureType = furnitureType;
        this.woodType = woodType != null ? woodType : WoodType.GENERIC;
        this.quantity = quantity;
        this.unitPrice = unitPrice != null ? unitPrice : Money.ZERO_BOB;
        this.dimensions = dimensions;
    }
}
