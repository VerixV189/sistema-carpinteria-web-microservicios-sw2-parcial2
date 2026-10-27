package com.carpinteria.business.domain.carpenter.model;

import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/** Aggregate Root — Carpintero (CU2). */
@Getter
public class Carpenter {

    private final Long id;
    private final Instant createdAt;
    @Setter private String name;
    @Setter private String email;
    @Setter private String phone;
    @Setter private Specialty specialty;
    @Setter private int yearsExperience;
    @Setter private double hourlyRate;
    @Setter private boolean active;
    @Setter private Instant updatedAt;

    public Carpenter(Long id, String name, String email, String phone, Specialty specialty,
                     int yearsExperience, double hourlyRate, boolean active,
                     Instant createdAt, Instant updatedAt) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("El nombre del carpintero es obligatorio");
        }
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Email inválido");
        }
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.specialty = specialty != null ? specialty : Specialty.GENERAL;
        this.yearsExperience = yearsExperience;
        this.hourlyRate = hourlyRate;
        this.active = active;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.updatedAt = updatedAt != null ? updatedAt : Instant.now();
    }
}
