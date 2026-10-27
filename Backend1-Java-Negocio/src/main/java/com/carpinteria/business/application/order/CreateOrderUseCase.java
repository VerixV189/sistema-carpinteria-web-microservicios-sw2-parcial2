package com.carpinteria.business.application.order;

import com.carpinteria.business.application.order.dto.CreateOrderCommand;
import com.carpinteria.business.application.order.dto.OrderResponse;
import com.carpinteria.business.domain.delivery.model.DeliveryType;
import com.carpinteria.business.domain.order.event.OrderCreatedEvent;
import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.model.OrderItem;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import com.carpinteria.business.domain.order.valueobject.Dimensions;
import com.carpinteria.business.domain.order.valueobject.Money;
import com.carpinteria.business.domain.order.valueobject.WoodType;
import com.carpinteria.business.infrastructure.messaging.EventPublisher;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class CreateOrderUseCase {

    private final OrderRepository repository;
    private final EventPublisher events;

    public CreateOrderUseCase(OrderRepository repository, EventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    public OrderResponse execute(CreateOrderCommand command) {
        List<OrderItem> items = command.items() == null ? List.of() : command.items().stream()
                .map(i -> new OrderItem(
                        null,
                        i.description(),
                        i.furnitureType(),
                        WoodType.of(i.woodType()),
                        i.quantity(),
                        Money.of(i.unitPrice()),
                        i.dimensions() != null
                                ? new Dimensions(i.dimensions().lengthM(),
                                        i.dimensions().widthM(), i.dimensions().heightM())
                                : null))
                .toList();

        Order order = new Order(null, command.clientId(), command.quotationId(),
                command.description(), null, items, null, null, null, null, null);
        order.setDeliveryType(DeliveryType.of(command.deliveryType()));
        order.setDeliveryAddress(command.deliveryAddress());
        order.setDeliveryLat(command.deliveryLat());
        order.setDeliveryLng(command.deliveryLng());
        Order saved = repository.save(order);
        // order.created → consumida por NestJS (cotización automática) y Python (estimar costos IA)
        events.publish("order.created",
                new OrderCreatedEvent(saved.getId().value(), saved.getClientId()));
        return OrderResponse.from(saved);
    }
}
