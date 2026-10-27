package com.carpinteria.business.application.client;

import com.carpinteria.business.application.client.dto.ClientDTO;
import com.carpinteria.business.domain.client.repository.ClientRepository;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class GetClientQuery {

    private final ClientRepository repository;

    public GetClientQuery(ClientRepository repository) {
        this.repository = repository;
    }

    public List<ClientDTO> all() {
        return repository.findAll().stream().map(ClientDTO::from).toList();
    }

    public ClientDTO byId(long id) {
        return repository.findById(id).map(ClientDTO::from).orElse(null);
    }
}
