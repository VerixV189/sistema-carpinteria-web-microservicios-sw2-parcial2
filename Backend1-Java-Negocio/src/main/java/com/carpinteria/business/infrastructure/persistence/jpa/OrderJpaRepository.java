package com.carpinteria.business.infrastructure.persistence.jpa;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderJpaRepository extends JpaRepository<OrderJpaEntity, Long> {
    List<OrderJpaEntity> findByStatus(String status);
    Optional<OrderJpaEntity> findByQuotationId(String quotationId);
}
