package com.carpinteria.business.infrastructure.persistence.jpa;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryJpaRepository extends JpaRepository<DeliveryJpaEntity, Long> {
    Optional<DeliveryJpaEntity> findByOrderId(long orderId);
    int countByScheduledDate(LocalDate date);
    List<DeliveryJpaEntity> findByScheduledDateBetween(LocalDate from, LocalDate to);
}
