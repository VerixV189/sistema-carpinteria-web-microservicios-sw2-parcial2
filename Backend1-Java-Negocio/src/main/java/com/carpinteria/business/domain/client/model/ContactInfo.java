package com.carpinteria.business.domain.client.model;

/** Value Object — datos de contacto del cliente. */
public record ContactInfo(String email, String phone, String address) {

    public ContactInfo {
        if (email == null || !email.contains("@")) {
            throw new IllegalArgumentException("Email inválido: " + email);
        }
    }
}
