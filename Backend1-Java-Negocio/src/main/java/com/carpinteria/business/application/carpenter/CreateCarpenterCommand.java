package com.carpinteria.business.application.carpenter;

public record CreateCarpenterCommand(String name, String email, String phone, String specialty,
                                     int yearsExperience, double hourlyRate) {}
