package com.carpinteria.business.application.client;

public record CreateClientCommand(String name, String email, String phone, String address) {}
