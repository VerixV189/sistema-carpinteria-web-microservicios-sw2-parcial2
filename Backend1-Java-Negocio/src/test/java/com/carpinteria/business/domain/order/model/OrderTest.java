package com.carpinteria.business.domain.order.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.carpinteria.business.domain.order.valueobject.Money;
import org.junit.jupiter.api.Test;

class OrderTest {

    private Order newOrder() {
        return new Order(1L);
    }

    @Test
    void transicionDeEstadoValida() {
        Order order = newOrder();
        order.changeStatus(OrderStatus.APPROVED);
        assertEquals(OrderStatus.APPROVED, order.getStatus());
    }

    @Test
    void transicionDeEstadoInvalidaLanzaExcepcion() {
        Order order = newOrder();
        assertThrows(IllegalArgumentException.class,
                () -> order.changeStatus(OrderStatus.DELIVERED));
    }

    @Test
    void totalPriceSumaItems() {
        Order order = newOrder();
        order.getItems().add(new OrderItem(null, "Mesa", null, null, 2, Money.of(100.0), null));
        order.getItems().add(new OrderItem(null, "Silla", null, null, 4, Money.of(50.0), null));
        assertEquals(400.0, order.getTotalPrice().amount().doubleValue());
    }
}
