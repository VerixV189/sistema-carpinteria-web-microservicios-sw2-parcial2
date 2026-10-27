package com.carpinteria.business.infrastructure.graphql.resolver;

import com.carpinteria.business.application.carpenter.dto.CarpenterDTO;
import com.carpinteria.business.application.client.dto.ClientDTO;
import com.carpinteria.business.application.delivery.dto.DeliveryDTO;
import com.carpinteria.business.application.order.CreateOrderUseCase;
import com.carpinteria.business.application.order.UpdateOrderStatusUseCase;
import com.carpinteria.business.application.order.dto.CreateOrderCommand;
import com.carpinteria.business.application.order.dto.DimensionsCommand;
import com.carpinteria.business.application.order.dto.OrderItemCommand;
import com.carpinteria.business.application.order.dto.OrderResponse;
import com.carpinteria.business.domain.carpenter.repository.CarpenterRepository;
import com.carpinteria.business.domain.client.repository.ClientRepository;
import com.carpinteria.business.domain.delivery.repository.DeliveryRepository;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.model.ProductionStep;
import com.carpinteria.business.domain.order.model.StepStatus;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import com.carpinteria.business.infrastructure.websocket.OrderSubscriptionBus;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.DgsSubscription;
import com.netflix.graphql.dgs.InputArgument;
import java.util.List;
import java.util.Map;
import org.reactivestreams.Publisher;

@DgsComponent
public class OrderResolver {

    private final OrderRepository repository;
    private final ClientRepository clientRepository;
    private final CarpenterRepository carpenterRepository;
    private final DeliveryRepository deliveryRepository;
    private final CreateOrderUseCase createOrder;
    private final UpdateOrderStatusUseCase updateOrderStatus;
    private final OrderSubscriptionBus subscriptionBus;

    public OrderResolver(OrderRepository repository, ClientRepository clientRepository,
                         CarpenterRepository carpenterRepository,
                         DeliveryRepository deliveryRepository, CreateOrderUseCase createOrder,
                         UpdateOrderStatusUseCase updateOrderStatus,
                         OrderSubscriptionBus subscriptionBus) {
        this.repository = repository;
        this.clientRepository = clientRepository;
        this.carpenterRepository = carpenterRepository;
        this.deliveryRepository = deliveryRepository;
        this.createOrder = createOrder;
        this.updateOrderStatus = updateOrderStatus;
        this.subscriptionBus = subscriptionBus;
    }

    @DgsQuery
    public List<OrderResponse> orders(@InputArgument String status) {
        return repository.findAll(status != null ? OrderStatus.valueOf(status) : null).stream()
                .map(OrderResponse::from).toList();
    }

    @DgsQuery
    public OrderResponse order(@InputArgument long id) {
        return repository.findById(id).map(OrderResponse::from).orElse(null);
    }

    @DgsMutation
    @SuppressWarnings("unchecked")
    public OrderResponse createOrder(@InputArgument Map<String, Object> input) {
        List<Map<String, Object>> rawItems =
                (List<Map<String, Object>>) input.getOrDefault("items", List.of());
        List<OrderItemCommand> items = rawItems.stream()
                .map(it -> {
                    Map<String, Object> d = (Map<String, Object>) it.get("dimensions");
                    return new OrderItemCommand(
                            (String) it.get("description"),
                            (String) it.get("furnitureType"),
                            (String) it.get("woodType"),
                            it.get("quantity") instanceof Number n ? n.intValue() : 1,
                            it.get("unitPrice") instanceof Number n ? n.doubleValue() : 0.0,
                            d != null ? new DimensionsCommand(
                                    ((Number) d.get("lengthM")).doubleValue(),
                                    ((Number) d.get("widthM")).doubleValue(),
                                    ((Number) d.get("heightM")).doubleValue()) : null);
                })
                .toList();
        return createOrder.execute(new CreateOrderCommand(
                Long.parseLong(String.valueOf(input.get("clientId"))),
                (String) input.get("quotationId"),
                (String) input.get("description"),
                items,
                (String) input.get("deliveryType"),
                (String) input.get("deliveryAddress"),
                input.get("deliveryLat") instanceof Number n ? n.doubleValue() : null,
                input.get("deliveryLng") instanceof Number n ? n.doubleValue() : null));
    }

    /** El cliente define cómo recibe su pedido: recojo en taller o envío con GPS. */
    @DgsMutation
    public OrderResponse setDeliveryPreference(@InputArgument long orderId,
                                               @InputArgument Map<String, Object> input) {
        return updateOrderStatus.setDeliveryPreference(orderId,
                (String) input.get("deliveryType"),
                (String) input.get("deliveryAddress"),
                input.get("deliveryLat") instanceof Number n ? n.doubleValue() : null,
                input.get("deliveryLng") instanceof Number n ? n.doubleValue() : null);
    }

    @DgsMutation
    public OrderResponse updateOrderStatus(@InputArgument long id, @InputArgument String status) {
        return updateOrderStatus.updateStatus(id, OrderStatus.valueOf(status));
    }

    @DgsMutation
    public OrderResponse assignCarpenter(@InputArgument long orderId,
                                         @InputArgument long carpenterId) {
        return updateOrderStatus.assignCarpenter(orderId, carpenterId);
    }

    @DgsMutation
    public ProductionStep updateStepStatus(@InputArgument long stepId,
                                           @InputArgument String status) {
        return updateOrderStatus.updateStep(stepId, StepStatus.valueOf(status));
    }

    @DgsMutation
    public OrderResponse linkQuotation(@InputArgument long orderId,
                                       @InputArgument String quotationId) {
        return updateOrderStatus.linkQuotation(orderId, quotationId);
    }

    @DgsData(parentType = "Order", field = "client")
    public ClientDTO client(DgsDataFetchingEnvironment dfe) {
        OrderResponse order = dfe.getSource();
        return clientRepository.findById(order.clientId()).map(ClientDTO::from).orElse(null);
    }

    @DgsData(parentType = "Order", field = "carpenters")
    public List<CarpenterDTO> carpenters(DgsDataFetchingEnvironment dfe) {
        OrderResponse order = dfe.getSource();
        return order.carpenterIds().stream()
                .map(id -> carpenterRepository.findById(id).orElse(null))
                .filter(c -> c != null)
                .map(CarpenterDTO::from)
                .toList();
    }

    @DgsData(parentType = "Order", field = "delivery")
    public DeliveryDTO delivery(DgsDataFetchingEnvironment dfe) {
        OrderResponse order = dfe.getSource();
        return deliveryRepository.findByOrderId(order.id()).map(DeliveryDTO::from).orElse(null);
    }

    /** Subscription CU4 — estado del pedido en vivo. */
    @DgsSubscription
    public Publisher<OrderResponse> orderStatusChanged() {
        return subscriptionBus.stream();
    }
}
