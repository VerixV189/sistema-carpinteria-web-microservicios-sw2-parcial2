package com.carpinteria.business.application.delivery.dto;

import com.carpinteria.business.domain.delivery.model.DeliverySchedule;

public record DeliveryDTO(long id, long orderId, String scheduledDate, String timeSlot,
                          String address, String status, String notes,
                          String deliveryType, Double latitude, Double longitude) {

    public static DeliveryDTO from(DeliverySchedule d) {
        return new DeliveryDTO(
                d.getId(), d.getOrderId(), d.getScheduledDate().toString(),
                d.getTimeSlot().name(), d.getAddress(), d.getStatus().name(), d.getNotes(),
                d.getDeliveryType().name(), d.getLatitude(), d.getLongitude());
    }
}
