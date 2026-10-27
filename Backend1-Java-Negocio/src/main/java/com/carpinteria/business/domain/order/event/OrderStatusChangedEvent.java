package com.carpinteria.business.domain.order.event;

import java.time.Instant;

public record OrderStatusChangedEvent(long orderId, String previousStatus, String newStatus,
                                      Instant occurredAt) {

    public OrderStatusChangedEvent(long orderId, String previousStatus, String newStatus) {
        this(orderId, previousStatus, newStatus, Instant.now());
    }
}
