package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.client.model.Client;
import com.carpinteria.business.domain.client.repository.ClientRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;

/** Adaptador OUT — implementa el port ClientRepository con JPA. */
@Repository
public class ClientRepositoryImpl implements ClientRepository {

    private final ClientJpaRepository jpa;

    public ClientRepositoryImpl(ClientJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<Client> findAll() {
        return jpa.findAll().stream().map(ClientJpaEntity::toDomain).toList();
    }

    @Override
    public Optional<Client> findById(long id) {
        return jpa.findById(id).map(ClientJpaEntity::toDomain);
    }

    @Override
    public Optional<Client> findByEmail(String email) {
        return jpa.findByEmail(email).map(ClientJpaEntity::toDomain);
    }

    @Override
    public Client save(Client client) {
        return jpa.save(ClientJpaEntity.from(client)).toDomain();
    }

    @Override
    public boolean delete(long id) {
        if (!jpa.existsById(id)) return false;
        jpa.deleteById(id);
        return true;
    }
}
