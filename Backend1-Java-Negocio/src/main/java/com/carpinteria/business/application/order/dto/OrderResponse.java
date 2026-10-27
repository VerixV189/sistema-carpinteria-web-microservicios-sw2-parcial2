package com.carpinteria.business.application.order.dto;

import com.carpinteria.business.domain.order.model.Order;
import java.util.List;

public record OrderResponse(long id, long clientId, String quotationId, String description,
                            String status, double totalPrice, String deliveryDate,
                            List<OrderItemResponse> items, List<ProductionStepResponse> steps,
                            List<Long> carpenterIds, String createdAt,
                            String deliveryType, String deliveryAddress,
                            Double deliveryLat, Double deliveryLng) {

    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId().value(),
                o.getClientId(),
                o.getQuotationId(),
                o.getDescription(),
                o.getStatus().name(),
                o.getTotalPrice().amount().doubleValue(),
                o.getDeliveryDate() != null ? o.getDeliveryDate().toString() : null,
                o.getItems().stream().map(OrderItemResponse::from).toList(),
                o.getSteps().stream().map(ProductionStepResponse::from).toList(),
                List.copyOf(o.getCarpenterIds()),
                o.getCreatedAt().toString(),
                o.getDeliveryType() != null ? o.getDeliveryType().name() : "DELIVERY",
                o.getDeliveryAddress(),
                o.getDeliveryLat(),
                o.getDeliveryLng());
    }
}
