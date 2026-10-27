package com.carpinteria.business.domain.carpenter.repository;

import com.carpinteria.business.domain.carpenter.model.Carpenter;
import java.util.List;
import java.util.Optional;

/** Port OUT — persistencia de carpinteros. */
public interface CarpenterRepository {
    List<Carpenter> findAll();
    Optional<Carpenter> findById(long id);
    Carpenter save(Carpenter carpenter);
    boolean delete(long id);
    List<Long> ordersOf(long carpenterId);
}
