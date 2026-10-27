package com.carpinteria.business.domain.order.model;

import java.util.Set;

public enum OrderStatus {
    PENDING(Set.of("APPROVED", "CANCELLED")),
    APPROVED(Set.of("IN_PRODUCTION", "CANCELLED")),
    IN_PRODUCTION(Set.of("READY", "CANCELLED")),
    READY(Set.of("DELIVERED")),
    DELIVERED(Set.of()),
    CANCELLED(Set.of());

    private final Set<String> allowedNext;

    OrderStatus(Set<String> allowedNext) {
        this.allowedNext = allowedNext;
    }

    public boolean canTransitionTo(OrderStatus next) {
        return allowedNext.contains(next.name()) || next == this;
    }
}
