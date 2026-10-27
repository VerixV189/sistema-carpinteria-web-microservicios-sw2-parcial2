package com.carpinteria.business.application.delivery;

import java.time.LocalDate;

public record ScheduleDeliveryCommand(long orderId, LocalDate scheduledDate, String timeSlot,
                                      String address, String notes, String deliveryType,
                                      Double latitude, Double longitude) {

    public ScheduleDeliveryCommand(long orderId, LocalDate scheduledDate) {
        this(orderId, scheduledDate, "MORNING", null, null, null, null, null);
    }
}
