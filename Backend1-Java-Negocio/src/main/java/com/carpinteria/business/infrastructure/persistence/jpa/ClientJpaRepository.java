package com.carpinteria.business.infrastructure.persistence.jpa;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientJpaRepository extends JpaRepository<ClientJpaEntity, Long> {
    Optional<ClientJpaEntity> findByEmail(String email);
}
