package com.carpinteria.business.domain.delivery.repository;

import com.carpinteria.business.domain.delivery.model.DeliverySchedule;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/** Port OUT — persistencia de entregas. */
public interface DeliveryRepository {
    List<DeliverySchedule> findAll(LocalDate from, LocalDate to);
    Optional<DeliverySchedule> findById(long id);
    Optional<DeliverySchedule> findByOrderId(long orderId);
    int countByDate(LocalDate date);
    DeliverySchedule save(DeliverySchedule delivery);
}
