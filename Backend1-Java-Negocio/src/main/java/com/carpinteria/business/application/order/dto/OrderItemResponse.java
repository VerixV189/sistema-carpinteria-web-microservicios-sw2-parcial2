package com.carpinteria.business.application.order.dto;

import com.carpinteria.business.domain.order.model.OrderItem;

public record OrderItemResponse(Long id, String description, String furnitureType, String woodType,
                                int quantity, double unitPrice, DimensionsResponse dimensions) {

    public static OrderItemResponse from(OrderItem i) {
        return new OrderItemResponse(
                i.getId(),
                i.getDescription(),
                i.getFurnitureType(),
                i.getWoodType().name(),
                i.getQuantity(),
                i.getUnitPrice().amount().doubleValue(),
                i.getDimensions() != null
                        ? new DimensionsResponse(i.getDimensions().lengthM(),
                                i.getDimensions().widthM(), i.getDimensions().heightM())
                        : null);
    }
}
