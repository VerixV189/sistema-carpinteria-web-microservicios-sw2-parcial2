package com.carpinteria.business.application.order;

import com.carpinteria.business.application.order.dto.OrderResponse;
import com.carpinteria.business.domain.delivery.model.DeliveryType;
import com.carpinteria.business.domain.order.event.OrderStatusChangedEvent;
import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.model.ProductionStep;
import com.carpinteria.business.domain.order.model.StepStatus;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import com.carpinteria.business.infrastructure.messaging.EventPublisher;
import com.carpinteria.business.infrastructure.websocket.OrderSubscriptionBus;
import org.springframework.stereotype.Service;

@Service
public class UpdateOrderStatusUseCase {

    private final OrderRepository repository;
    private final EventPublisher events;
    private final OrderSubscriptionBus subscriptionBus;

    public UpdateOrderStatusUseCase(OrderRepository repository, EventPublisher events,
                                    OrderSubscriptionBus subscriptionBus) {
        this.repository = repository;
        this.events = events;
        this.subscriptionBus = subscriptionBus;
    }

    public OrderResponse updateStatus(long orderId, OrderStatus status) {
        Order order = repository.findById(orderId).orElse(null);
        if (order == null) return null;
        OrderStatus previous = order.getStatus();
        order.changeStatus(status);
        Order saved = repository.save(order);
        OrderResponse response = OrderResponse.from(saved);
        // Evento RabbitMQ → gateway WebSocket + GraphQL subscription interna
        events.publish("order.status_changed",
                new OrderStatusChangedEvent(saved.getId().value(), previous.name(), status.name()));
        subscriptionBus.emit(response);
        return response;
    }

    public OrderResponse assignCarpenter(long orderId, long carpenterId) {
        Order order = repository.findById(orderId).orElse(null);
        if (order == null) return null;
        order.assignCarpenter(carpenterId);
        return OrderResponse.from(repository.save(order));
    }

    public ProductionStep updateStep(long stepId, StepStatus status) {
        return repository.updateStep(stepId, status).orElse(null);
    }

    public OrderResponse linkQuotation(long orderId, String quotationId) {
        Order order = repository.findById(orderId).orElse(null);
        if (order == null) return null;
        order.linkQuotation(quotationId);
        return OrderResponse.from(repository.save(order));
    }

    /** Guarda la modalidad de entrega elegida por el cliente en el pedido. */
    public OrderResponse setDeliveryPreference(long orderId, String deliveryType,
                                               String deliveryAddress,
                                               Double deliveryLat, Double deliveryLng) {
        Order order = repository.findById(orderId).orElse(null);
        if (order == null) return null;
        if (deliveryType != null) order.setDeliveryType(DeliveryType.of(deliveryType));
        if (deliveryAddress != null) order.setDeliveryAddress(deliveryAddress);
        if (deliveryLat != null) order.setDeliveryLat(deliveryLat);
        if (deliveryLng != null) order.setDeliveryLng(deliveryLng);
        return OrderResponse.from(repository.save(order));
    }
}
