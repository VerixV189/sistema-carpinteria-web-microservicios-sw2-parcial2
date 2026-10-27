package com.carpinteria.business.infrastructure.persistence.jpa;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderCarpenterJpaRepository
        extends JpaRepository<OrderCarpenterJpaEntity, OrderCarpenterId> {

    List<OrderCarpenterJpaEntity> findByCarpenterId(long carpenterId);
}
