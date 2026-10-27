package com.carpinteria.business.domain.client.service;

import com.carpinteria.business.domain.client.model.Client;
import com.carpinteria.business.domain.client.repository.ClientRepository;
import org.springframework.stereotype.Service;

@Service
public class ClientDomainService {

    private final ClientRepository repository;

    public ClientDomainService(ClientRepository repository) {
        this.repository = repository;
    }

    /** Regla de dominio: email único por cliente. */
    public void assertEmailAvailable(String email, Long excludingId) {
        repository.findByEmail(email).ifPresent(existing -> {
            if (!existing.getId().equals(excludingId)) {
                throw new DomainException("Ya existe un cliente con email " + email);
            }
        });
    }

    public void assertEmailAvailable(String email) {
        assertEmailAvailable(email, null);
    }

    public Client save(Client client) {
        return repository.save(client);
    }
}
