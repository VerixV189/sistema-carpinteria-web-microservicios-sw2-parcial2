package com.carpinteria.business.application.order.dto;

import java.util.List;

public record CreateOrderCommand(long clientId, String quotationId, String description,
                                 List<OrderItemCommand> items, String deliveryType,
                                 String deliveryAddress, Double deliveryLat, Double deliveryLng) {

    public CreateOrderCommand(long clientId, String quotationId, String description,
                              List<OrderItemCommand> items) {
        this(clientId, quotationId, description, items, null, null, null, null);
    }

    public CreateOrderCommand(long clientId) {
        this(clientId, null, null, List.of());
    }
}
