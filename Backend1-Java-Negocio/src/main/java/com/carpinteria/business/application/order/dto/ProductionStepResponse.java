package com.carpinteria.business.application.order.dto;

import com.carpinteria.business.domain.order.model.ProductionStep;

public record ProductionStepResponse(Long id, String name, String status, int sequence,
                                     String completedAt) {

    public static ProductionStepResponse from(ProductionStep s) {
        return new ProductionStepResponse(
                s.getId(), s.getName(), s.getStatus().name(), s.getSequence(),
                s.getCompletedAt() != null ? s.getCompletedAt().toString() : null);
    }
}
