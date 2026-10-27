package com.carpinteria.business.domain.delivery.model;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/** Aggregate — Programación de entrega (CU4). */
@Getter
public class DeliverySchedule {

    private final Long id;
    private final long orderId;
    @Setter private LocalDate scheduledDate;
    @Setter private TimeSlot timeSlot;
    @Setter private String address;
    @Setter private DeliveryStatus status;
    @Setter private String notes;
    @Setter private DeliveryType deliveryType;
    @Setter private Double latitude;
    @Setter private Double longitude;

    public DeliverySchedule(Long id, long orderId, LocalDate scheduledDate, TimeSlot timeSlot,
                            String address, DeliveryStatus status, String notes) {
        this(id, orderId, scheduledDate, timeSlot, address, status, notes,
                DeliveryType.DELIVERY, null, null);
    }

    public DeliverySchedule(Long id, long orderId, LocalDate scheduledDate, TimeSlot timeSlot,
                            String address, DeliveryStatus status, String notes,
                            DeliveryType deliveryType, Double latitude, Double longitude) {
        this.id = id;
        this.orderId = orderId;
        this.scheduledDate = scheduledDate;
        this.timeSlot = timeSlot != null ? timeSlot : TimeSlot.MORNING;
        this.address = address;
        this.status = status != null ? status : DeliveryStatus.SCHEDULED;
        this.notes = notes;
        this.deliveryType = deliveryType != null ? deliveryType : DeliveryType.DELIVERY;
        this.latitude = latitude;
        this.longitude = longitude;
    }
}
