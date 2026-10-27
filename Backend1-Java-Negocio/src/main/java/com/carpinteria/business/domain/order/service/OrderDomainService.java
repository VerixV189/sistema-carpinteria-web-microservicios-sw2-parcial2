package com.carpinteria.business.domain.order.service;

import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

@Service
public class OrderDomainService {

    /** Máx. entregas por día (regla consultada por el agente MCP `check_delivery_date` — CU4). */
    public static final int MAX_DELIVERIES_PER_DAY = 4;

    private final OrderRepository repository;

    public OrderDomainService(OrderRepository repository) {
        this.repository = repository;
    }

    /** Capacidad de entrega: máx. 4 entregas por día. */
    public boolean hasDeliveryCapacity(LocalDate date, int scheduledCount) {
        return scheduledCount < MAX_DELIVERIES_PER_DAY;
    }

    public Order save(Order order) {
        return repository.save(order);
    }
}
