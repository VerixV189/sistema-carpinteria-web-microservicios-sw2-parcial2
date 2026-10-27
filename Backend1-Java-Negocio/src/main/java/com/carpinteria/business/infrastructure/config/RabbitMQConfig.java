package com.carpinteria.business.infrastructure.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Bean
    public TopicExchange topicExchange(@Value("${carpinteria.rabbitmq.exchange}") String exchange) {
        return new TopicExchange(exchange, true, false);
    }

    /** Colas propias del servicio (consumidores §5.5). */
    @Bean
    public Queue quotationApprovedQueue(
            @Value("${carpinteria.rabbitmq.queues.quotation-approved}") String name) {
        return new Queue(name, true);
    }

    @Bean
    public Queue paymentCompletedQueue() {
        return new Queue("business.payment_completed", true);
    }

    @Bean
    public Binding bindQuotationApproved(Queue quotationApprovedQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(quotationApprovedQueue).to(topicExchange).with("quotation.approved");
    }

    @Bean
    public Binding bindPaymentCompleted(Queue paymentCompletedQueue, TopicExchange topicExchange) {
        return BindingBuilder.bind(paymentCompletedQueue).to(topicExchange).with("payment.completed");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}
