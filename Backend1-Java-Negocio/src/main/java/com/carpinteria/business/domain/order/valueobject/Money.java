package com.carpinteria.business.domain.order.valueobject;

import java.math.BigDecimal;

/** Value Object — dinero (bolivianos por defecto). */
public record Money(BigDecimal amount, String currency) {

    public static final Money ZERO_BOB = new Money(BigDecimal.ZERO, "BOB");

    public Money {
        if (amount == null || amount.signum() < 0) {
            throw new IllegalArgumentException("Monto negativo no permitido");
        }
        if (currency == null) currency = "BOB";
    }

    public Money(BigDecimal amount) {
        this(amount, "BOB");
    }

    public static Money of(double amount) {
        return new Money(BigDecimal.valueOf(amount));
    }
}
