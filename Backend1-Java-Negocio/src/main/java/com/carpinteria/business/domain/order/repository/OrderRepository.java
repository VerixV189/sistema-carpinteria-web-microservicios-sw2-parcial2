package com.carpinteria.business.domain.order.repository;

import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.model.ProductionStep;
import com.carpinteria.business.domain.order.model.StepStatus;
import java.util.List;
import java.util.Optional;

/** Port OUT — persistencia de pedidos. */
public interface OrderRepository {
    List<Order> findAll(OrderStatus status);
    Optional<Order> findById(long id);
    Optional<Order> findByQuotationId(String quotationId);
    Order save(Order order);
    Optional<ProductionStep> findStep(long stepId);
    Optional<ProductionStep> updateStep(long stepId, StepStatus status);
    List<Order> ordersOfCarpenter(long carpenterId);
}
