package com.carpinteria.business.domain.client.repository;

import com.carpinteria.business.domain.client.model.Client;
import java.util.List;
import java.util.Optional;

/** Port OUT — persistencia de clientes. La implementación vive en infrastructure. */
public interface ClientRepository {
    List<Client> findAll();
    Optional<Client> findById(long id);
    Optional<Client> findByEmail(String email);
    Client save(Client client);
    boolean delete(long id);
}
