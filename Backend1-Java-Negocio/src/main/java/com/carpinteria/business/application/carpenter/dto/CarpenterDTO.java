package com.carpinteria.business.application.carpenter.dto;

import com.carpinteria.business.domain.carpenter.model.Carpenter;

public record CarpenterDTO(long id, String name, String email, String phone, String specialty,
                           int yearsExperience, double hourlyRate, boolean active) {

    public static CarpenterDTO from(Carpenter c) {
        return new CarpenterDTO(
                c.getId(), c.getName(), c.getEmail(), c.getPhone(),
                c.getSpecialty().name(), c.getYearsExperience(), c.getHourlyRate(), c.isActive());
    }
}
