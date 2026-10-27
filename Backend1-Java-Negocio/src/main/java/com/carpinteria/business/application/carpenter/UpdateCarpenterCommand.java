package com.carpinteria.business.application.carpenter;

public record UpdateCarpenterCommand(String name, String email, String phone, String specialty,
                                     Integer yearsExperience, Double hourlyRate, Boolean active) {}
