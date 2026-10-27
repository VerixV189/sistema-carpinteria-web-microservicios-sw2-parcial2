package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.model.ProductionStep;
import com.carpinteria.business.domain.order.model.StepStatus;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class OrderRepositoryImpl implements OrderRepository {

    private final OrderJpaRepository jpa;
    private final ProductionStepJpaRepository stepJpa;
    private final OrderCarpenterJpaRepository orderCarpenterJpa;

    public OrderRepositoryImpl(OrderJpaRepository jpa,
                               ProductionStepJpaRepository stepJpa,
                               OrderCarpenterJpaRepository orderCarpenterJpa) {
        this.jpa = jpa;
        this.stepJpa = stepJpa;
        this.orderCarpenterJpa = orderCarpenterJpa;
    }

    @Override
    public List<Order> findAll(OrderStatus status) {
        List<OrderJpaEntity> entities =
                status != null ? jpa.findByStatus(status.name()) : jpa.findAll();
        return entities.stream().map(OrderJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<Order> findById(long id) {
        return jpa.findById(id).map(OrderJpaEntity::toDomain);
    }

    @Override
    public Optional<Order> findByQuotationId(String quotationId) {
        if (quotationId == null) return Optional.empty();
        return jpa.findByQuotationId(quotationId).map(OrderJpaEntity::toDomain);
    }

    @Override
    @Transactional
    public Order save(Order order) {
        return jpa.save(OrderJpaEntity.from(order)).toDomain();
    }

    @Override
    public Optional<ProductionStep> findStep(long stepId) {
        return stepJpa.findById(stepId).map(ProductionStepJpaEntity::toDomain);
    }

    @Override
    @Transactional
    public Optional<ProductionStep> updateStep(long stepId, StepStatus status) {
        ProductionStepJpaEntity step = stepJpa.findById(stepId).orElse(null);
        if (step == null) return Optional.empty();
        step.setStatus(status.name());
        step.setCompletedAt(status == StepStatus.COMPLETED ? Instant.now() : null);
        return Optional.of(stepJpa.save(step).toDomain());
    }

    @Override
    public List<Order> ordersOfCarpenter(long carpenterId) {
        return orderCarpenterJpa.findByCarpenterId(carpenterId).stream()
                .map(oc -> jpa.findById(oc.getOrderId()).map(OrderJpaEntity::toDomain).orElse(null))
                .filter(o -> o != null)
                .toList();
    }
}
