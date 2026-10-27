package com.carpinteria.business.infrastructure.persistence.jpa;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CarpenterJpaRepository extends JpaRepository<CarpenterJpaEntity, Long> {

    @Query("SELECT oc.orderId FROM OrderCarpenterJpaEntity oc WHERE oc.carpenterId = :carpenterId")
    List<Long> orderIdsOf(long carpenterId);
}
