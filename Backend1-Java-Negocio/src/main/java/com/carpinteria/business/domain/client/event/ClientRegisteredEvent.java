package com.carpinteria.business.domain.client.event;

import java.time.Instant;

/** Evento de dominio — cliente registrado (CU1). */
public record ClientRegisteredEvent(long clientId, String email, String name, Instant occurredAt) {

    public ClientRegisteredEvent(long clientId, String email, String name) {
        this(clientId, email, name, Instant.now());
    }
}
