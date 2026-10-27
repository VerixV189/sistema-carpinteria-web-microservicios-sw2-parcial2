package com.carpinteria.business.infrastructure.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class RabbitMQPublisher implements EventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQPublisher.class);

    private final RabbitTemplate template;
    private final String exchange;

    public RabbitMQPublisher(RabbitTemplate template,
                             @Value("${carpinteria.rabbitmq.exchange}") String exchange) {
        this.template = template;
        this.exchange = exchange;
    }

    @Override
    public void publish(String routingKey, Object event) {
        try {
            template.convertAndSend(exchange, routingKey, event);
            log.debug("Evento publicado: {} → {}", routingKey, event);
        } catch (Exception e) {
            log.warn("No se pudo publicar {}: {}", routingKey, e.getMessage());
        }
    }
}
