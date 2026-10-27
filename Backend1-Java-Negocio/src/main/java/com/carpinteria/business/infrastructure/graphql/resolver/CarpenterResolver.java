package com.carpinteria.business.infrastructure.graphql.resolver;

import com.carpinteria.business.application.carpenter.CreateCarpenterCommand;
import com.carpinteria.business.application.carpenter.RegisterCarpenterUseCase;
import com.carpinteria.business.application.carpenter.UpdateCarpenterCommand;
import com.carpinteria.business.application.carpenter.dto.CarpenterDTO;
import com.carpinteria.business.application.order.dto.OrderResponse;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import java.util.List;
import java.util.Map;

/** Adaptador GraphQL — CU2 Gestionar Carpintero. */
@DgsComponent
public class CarpenterResolver {

    private final RegisterCarpenterUseCase useCase;
    private final OrderRepository orderRepository;

    public CarpenterResolver(RegisterCarpenterUseCase useCase, OrderRepository orderRepository) {
        this.useCase = useCase;
        this.orderRepository = orderRepository;
    }

    @DgsQuery
    public List<CarpenterDTO> carpenters() {
        return useCase.all();
    }

    @DgsQuery
    public CarpenterDTO carpenter(@InputArgument long id) {
        return useCase.byId(id);
    }

    @DgsQuery
    public List<OrderResponse> carpenterWorkload(@InputArgument long carpenterId) {
        return orderRepository.ordersOfCarpenter(carpenterId).stream()
                .map(OrderResponse::from).toList();
    }

    @DgsMutation
    public CarpenterDTO createCarpenter(@InputArgument Map<String, Object> input) {
        String specialty = (String) input.get("specialty");
        return useCase.register(new CreateCarpenterCommand(
                (String) input.get("name"),
                (String) input.get("email"),
                (String) input.get("phone"),
                specialty != null ? specialty : "GENERAL",
                input.get("yearsExperience") instanceof Number n ? n.intValue() : 0,
                input.get("hourlyRate") instanceof Number n ? n.doubleValue() : 0.0));
    }

    @DgsMutation
    public CarpenterDTO updateCarpenter(@InputArgument long id,
                                        @InputArgument Map<String, Object> input) {
        return useCase.update(id, new UpdateCarpenterCommand(
                (String) input.get("name"),
                (String) input.get("email"),
                (String) input.get("phone"),
                (String) input.get("specialty"),
                input.get("yearsExperience") instanceof Number n ? n.intValue() : null,
                input.get("hourlyRate") instanceof Number n ? n.doubleValue() : null,
                (Boolean) input.get("active")));
    }

    @DgsMutation
    public boolean deleteCarpenter(@InputArgument long id) {
        return useCase.delete(id);
    }
}
