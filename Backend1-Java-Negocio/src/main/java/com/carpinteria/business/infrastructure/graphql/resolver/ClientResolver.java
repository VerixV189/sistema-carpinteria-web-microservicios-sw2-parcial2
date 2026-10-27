package com.carpinteria.business.infrastructure.graphql.resolver;

import com.carpinteria.business.application.client.CreateClientCommand;
import com.carpinteria.business.application.client.GetClientQuery;
import com.carpinteria.business.application.client.RegisterClientUseCase;
import com.carpinteria.business.application.client.UpdateClientCommand;
import com.carpinteria.business.application.client.dto.ClientDTO;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import java.util.List;
import java.util.Map;

/** Adaptador GraphQL (entrada) — CU1 Gestionar Cliente. */
@DgsComponent
public class ClientResolver {

    private final GetClientQuery getClient;
    private final RegisterClientUseCase registerClient;

    public ClientResolver(GetClientQuery getClient, RegisterClientUseCase registerClient) {
        this.getClient = getClient;
        this.registerClient = registerClient;
    }

    @DgsQuery
    public List<ClientDTO> clients() {
        return getClient.all();
    }

    @DgsQuery
    public ClientDTO client(@InputArgument long id) {
        return getClient.byId(id);
    }

    @DgsMutation
    public ClientDTO createClient(@InputArgument Map<String, Object> input) {
        return registerClient.register(new CreateClientCommand(
                (String) input.get("name"),
                (String) input.get("email"),
                (String) input.get("phone"),
                (String) input.get("address")));
    }

    @DgsMutation
    public ClientDTO updateClient(@InputArgument long id,
                                  @InputArgument Map<String, Object> input) {
        return registerClient.update(id, new UpdateClientCommand(
                (String) input.get("name"),
                (String) input.get("email"),
                (String) input.get("phone"),
                (String) input.get("address"),
                (String) input.get("segment")));
    }

    @DgsMutation
    public boolean deleteClient(@InputArgument long id) {
        return registerClient.delete(id);
    }
}
