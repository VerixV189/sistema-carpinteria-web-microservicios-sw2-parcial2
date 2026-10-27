package com.carpinteria.business.application.client;

public record UpdateClientCommand(String name, String email, String phone, String address,
                                  String segment) {}
