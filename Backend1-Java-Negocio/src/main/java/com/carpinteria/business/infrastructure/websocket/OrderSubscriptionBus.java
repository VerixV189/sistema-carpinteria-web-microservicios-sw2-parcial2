package com.carpinteria.business.infrastructure.websocket;

import com.carpinteria.business.application.order.dto.OrderResponse;
import org.reactivestreams.Publisher;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Sinks;

/**
 * Bus interno para la subscription GraphQL `orderStatusChanged` (CU4).
 * Las mutaciones publican aquí; DGS expone el Publisher a los clientes WS.
 */
@Component
public class OrderSubscriptionBus {

    private final Sinks.Many<OrderResponse> sink =
            Sinks.many().multicast().directBestEffort();

    public void emit(OrderResponse order) {
        sink.tryEmitNext(order);
    }

    public Publisher<OrderResponse> stream() {
        return sink.asFlux();
    }
}
