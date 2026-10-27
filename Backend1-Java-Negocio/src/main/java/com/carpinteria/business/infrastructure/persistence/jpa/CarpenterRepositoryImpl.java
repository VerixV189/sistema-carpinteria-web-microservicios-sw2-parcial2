package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.carpenter.model.Carpenter;
import com.carpinteria.business.domain.carpenter.repository.CarpenterRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

@Repository
public class CarpenterRepositoryImpl implements CarpenterRepository {

    private final CarpenterJpaRepository jpa;
    private final OrderCarpenterJpaRepository orderCarpenterJpa;

    public CarpenterRepositoryImpl(CarpenterJpaRepository jpa,
                                   OrderCarpenterJpaRepository orderCarpenterJpa) {
        this.jpa = jpa;
        this.orderCarpenterJpa = orderCarpenterJpa;
    }

    @Override
    public List<Carpenter> findAll() {
        return jpa.findAll().stream().map(CarpenterJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<Carpenter> findById(long id) {
        return jpa.findById(id).map(CarpenterJpaEntity::toDomain);
    }

    @Override
    public Carpenter save(Carpenter carpenter) {
        return jpa.save(CarpenterJpaEntity.from(carpenter)).toDomain();
    }

    @Override
    public boolean delete(long id) {
        if (!jpa.existsById(id)) return false;
        jpa.deleteById(id);
        return true;
    }

    @Override
    public List<Long> ordersOf(long carpenterId) {
        return orderCarpenterJpa.findByCarpenterId(carpenterId).stream()
                .map(OrderCarpenterJpaEntity::getOrderId).toList();
    }
}
