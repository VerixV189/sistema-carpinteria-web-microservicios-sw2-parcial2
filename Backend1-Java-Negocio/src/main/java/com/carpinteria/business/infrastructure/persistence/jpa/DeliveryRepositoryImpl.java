package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.delivery.model.DeliverySchedule;
import com.carpinteria.business.domain.delivery.repository.DeliveryRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class DeliveryRepositoryImpl implements DeliveryRepository {

    private final DeliveryJpaRepository jpa;

    public DeliveryRepositoryImpl(DeliveryJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<DeliverySchedule> findAll(LocalDate from, LocalDate to) {
        List<DeliveryJpaEntity> entities = (from != null && to != null)
                ? jpa.findByScheduledDateBetween(from, to)
                : jpa.findAll();
        return entities.stream().map(DeliveryJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<DeliverySchedule> findById(long id) {
        return jpa.findById(id).map(DeliveryJpaEntity::toDomain);
    }

    @Override
    public Optional<DeliverySchedule> findByOrderId(long orderId) {
        return jpa.findByOrderId(orderId).map(DeliveryJpaEntity::toDomain);
    }

    @Override
    public int countByDate(LocalDate date) {
        return jpa.countByScheduledDate(date);
    }

    @Override
    public DeliverySchedule save(DeliverySchedule delivery) {
        return jpa.save(DeliveryJpaEntity.from(delivery)).toDomain();
    }
}
