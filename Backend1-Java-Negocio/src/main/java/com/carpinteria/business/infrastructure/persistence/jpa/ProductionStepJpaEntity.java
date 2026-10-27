package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.order.model.ProductionStep;
import com.carpinteria.business.domain.order.model.StepStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "production_steps")
@Getter
@Setter
@NoArgsConstructor
public class ProductionStepJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Lado propietario — la FK order_id (NOT NULL) se escribe en el INSERT. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderJpaEntity order;

    private String name;
    private String status = "PENDING";
    private int sequence;

    @Column(name = "completed_at")
    private Instant completedAt;

    public ProductionStep toDomain() {
        return new ProductionStep(id, name, StepStatus.valueOf(status), sequence, completedAt);
    }

    public static ProductionStepJpaEntity from(ProductionStep s) {
        ProductionStepJpaEntity e = new ProductionStepJpaEntity();
        e.id = s.getId();
        e.name = s.getName();
        e.status = s.getStatus().name();
        e.sequence = s.getSequence();
        e.completedAt = s.getCompletedAt();
        return e;
    }
}
