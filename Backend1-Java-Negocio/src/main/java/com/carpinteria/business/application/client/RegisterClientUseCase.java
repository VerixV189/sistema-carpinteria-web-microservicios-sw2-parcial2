package com.carpinteria.business.application.client;

import com.carpinteria.business.application.client.dto.ClientDTO;
import com.carpinteria.business.domain.client.event.ClientRegisteredEvent;
import com.carpinteria.business.domain.client.model.Client;
import com.carpinteria.business.domain.client.model.ClientSegment;
import com.carpinteria.business.domain.client.model.ContactInfo;
import com.carpinteria.business.domain.client.repository.ClientRepository;
import com.carpinteria.business.domain.client.service.ClientDomainService;
import com.carpinteria.business.infrastructure.messaging.EventPublisher;
import org.springframework.stereotype.Service;

/** CU1 — Registrar/gestionar cliente. */
@Service
public class RegisterClientUseCase {

    private final ClientRepository repository;
    private final ClientDomainService domainService;
    private final EventPublisher events;

    public RegisterClientUseCase(ClientRepository repository, ClientDomainService domainService,
                                 EventPublisher events) {
        this.repository = repository;
        this.domainService = domainService;
        this.events = events;
    }

    public ClientDTO register(CreateClientCommand command) {
        domainService.assertEmailAvailable(command.email());
        Client client = new Client(null, command.name(),
                new ContactInfo(command.email(), command.phone(), command.address()),
                null, null, null);
        Client saved = repository.save(client);
        events.publish("client.registered",
                new ClientRegisteredEvent(saved.getId(), saved.getContactInfo().email(), saved.getName()));
        return ClientDTO.from(saved);
    }

    public ClientDTO update(long id, UpdateClientCommand command) {
        Client client = repository.findById(id).orElse(null);
        if (client == null) return null;
        if (command.email() != null) {
            domainService.assertEmailAvailable(command.email(), id);
        }
        ContactInfo newContact = null;
        if (command.email() != null || command.phone() != null || command.address() != null) {
            ContactInfo old = client.getContactInfo();
            newContact = new ContactInfo(
                    command.email() != null ? command.email() : old.email(),
                    command.phone() != null ? command.phone() : old.phone(),
                    command.address() != null ? command.address() : old.address());
        }
        client.update(command.name(), newContact,
                command.segment() != null
                        ? ClientSegment.valueOf(command.segment().toUpperCase()) : null);
        return ClientDTO.from(repository.save(client));
    }

    public boolean delete(long id) {
        return repository.delete(id);
    }
}
