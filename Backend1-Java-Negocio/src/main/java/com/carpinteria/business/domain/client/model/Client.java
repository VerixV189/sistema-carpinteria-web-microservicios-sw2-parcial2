package com.carpinteria.business.domain.client.model;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** Aggregate Root — Cliente (CU1). */
@Getter
public class Client {

    private final Long id;
    private final Instant createdAt;
    @Setter private String name;
    @Setter private ContactInfo contactInfo;
    @Setter private ClientSegment segment;
    @Setter private Instant updatedAt;

    public Client(Long id, String name, ContactInfo contactInfo, ClientSegment segment,
                  Instant createdAt, Instant updatedAt) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre del cliente es obligatorio");
        }
        this.id = id;
        this.name = name;
        this.contactInfo = contactInfo;
        this.segment = segment != null ? segment : ClientSegment.REGULAR;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }

    public void update(String name, ContactInfo contactInfo, ClientSegment segment) {
        if (name != null) {
            if (name.isBlank()) throw new IllegalArgumentException("Nombre no puede ser vacío");
            this.name = name;
        }
        if (contactInfo != null) this.contactInfo = contactInfo;
        if (segment != null) this.segment = segment;
        this.updatedAt = Instant.now();
    }
}
