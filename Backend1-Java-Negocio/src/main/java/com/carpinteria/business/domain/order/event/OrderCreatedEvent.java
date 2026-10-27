package com.carpinteria.business.domain.order.event;

import java.time.Instant;

public record OrderCreatedEvent(long orderId, long clientId, Instant occurredAt) {

    public OrderCreatedEvent(long orderId, long clientId) {
        this(orderId, clientId, Instant.now());
    }
}
