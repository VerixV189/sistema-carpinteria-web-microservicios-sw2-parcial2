package com.carpinteria.business.infrastructure.messaging;

/** Port OUT — publicación de eventos de dominio. */
public interface EventPublisher {
    void publish(String routingKey, Object event);
}
