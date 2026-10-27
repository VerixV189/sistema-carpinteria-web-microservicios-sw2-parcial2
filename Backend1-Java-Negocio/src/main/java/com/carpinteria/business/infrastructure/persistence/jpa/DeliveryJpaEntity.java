package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.delivery.model.DeliverySchedule;
import com.carpinteria.business.domain.delivery.model.DeliveryStatus;
import com.carpinteria.business.domain.delivery.model.DeliveryType;
import com.carpinteria.business.domain.delivery.model.TimeSlot;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
public class DeliveryJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private long orderId;

    @Column(name = "scheduled_date", nullable = false)
    private LocalDate scheduledDate;

    @Column(name = "time_slot")
    private String timeSlot = "MORNING";

    private String address;
    private String status = "SCHEDULED";
    private String notes;

    @Column(name = "delivery_type", nullable = false)
    private String deliveryType = "DELIVERY";

    private Double latitude;
    private Double longitude;

    public DeliverySchedule toDomain() {
        return new DeliverySchedule(id, orderId, scheduledDate, TimeSlot.of(timeSlot),
                address, DeliveryStatus.valueOf(status), notes,
                DeliveryType.of(deliveryType), latitude, longitude);
    }

    public static DeliveryJpaEntity from(DeliverySchedule d) {
        DeliveryJpaEntity e = new DeliveryJpaEntity();
        e.id = d.getId();
        e.orderId = d.getOrderId();
        e.scheduledDate = d.getScheduledDate();
        e.timeSlot = d.getTimeSlot().name();
        e.address = d.getAddress();
        e.status = d.getStatus().name();
        e.notes = d.getNotes();
        e.deliveryType = d.getDeliveryType().name();
        e.latitude = d.getLatitude();
        e.longitude = d.getLongitude();
        return e;
    }
}
