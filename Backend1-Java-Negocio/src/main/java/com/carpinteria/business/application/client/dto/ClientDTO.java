package com.carpinteria.business.application.client.dto;

import com.carpinteria.business.domain.client.model.Client;

public record ClientDTO(long id, String name, String email, String phone, String address,
                        String segment, String createdAt) {

    public static ClientDTO from(Client c) {
        return new ClientDTO(
                c.getId(),
                c.getName(),
                c.getContactInfo().email(),
                c.getContactInfo().phone(),
                c.getContactInfo().address(),
                c.getSegment().name(),
                c.getCreatedAt().toString());
    }
}
