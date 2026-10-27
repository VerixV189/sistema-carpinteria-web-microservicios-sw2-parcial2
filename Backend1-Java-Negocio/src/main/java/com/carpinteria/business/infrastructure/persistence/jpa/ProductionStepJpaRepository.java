package com.carpinteria.business.infrastructure.persistence.jpa;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionStepJpaRepository
        extends JpaRepository<ProductionStepJpaEntity, Long> {}
