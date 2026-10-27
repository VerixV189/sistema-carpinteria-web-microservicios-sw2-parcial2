package com.carpinteria.business.application.order.dto;

public record OrderItemCommand(String description, String furnitureType, String woodType,
                               int quantity, double unitPrice, DimensionsCommand dimensions) {}
