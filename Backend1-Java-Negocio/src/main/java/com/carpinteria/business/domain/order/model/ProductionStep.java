package com.carpinteria.business.domain.order.model;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** Paso del proceso productivo de un pedido (avance de taller — CU2 móvil). */
@Getter
public class ProductionStep {

    private final Long id;
    private final String name;
    private final int sequence;
    @Setter private StepStatus status;
    @Setter private Instant completedAt;

    public ProductionStep(Long id, String name, StepStatus status, int sequence, Instant completedAt) {
        this.id = id;
        this.name = name;
        this.status = status != null ? status : StepStatus.PENDING;
        this.sequence = sequence;
        this.completedAt = completedAt;
    }

    public void mark(StepStatus next) {
        this.status = next;
        this.completedAt = next == StepStatus.COMPLETED ? Instant.now() : null;
    }
}
