package com.carpinteria.business.infrastructure.graphql.resolver;

import com.carpinteria.business.application.delivery.ScheduleDeliveryCommand;
import com.carpinteria.business.application.delivery.ScheduleDeliveryUseCase;
import com.carpinteria.business.application.delivery.dto.DeliveryDTO;
import com.carpinteria.business.domain.delivery.model.DeliveryStatus;
import com.carpinteria.business.domain.delivery.repository.DeliveryRepository;
import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.DgsQuery;
import com.netflix.graphql.dgs.InputArgument;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/** Adaptador GraphQL — CU4 Administrar Fecha de Entrega. */
@DgsComponent
public class DeliveryResolver {

    private final DeliveryRepository repository;
    private final ScheduleDeliveryUseCase scheduleDelivery;

    public DeliveryResolver(DeliveryRepository repository,
                            ScheduleDeliveryUseCase scheduleDelivery) {
        this.repository = repository;
        this.scheduleDelivery = scheduleDelivery;
    }

    @DgsQuery
    public List<DeliveryDTO> deliveries(@InputArgument String from, @InputArgument String to) {
        return repository.findAll(
                from != null ? LocalDate.parse(from) : null,
                to != null ? LocalDate.parse(to) : null)
                .stream().map(DeliveryDTO::from).toList();
    }

    @DgsQuery
    public DeliveryDTO delivery(@InputArgument long orderId) {
        return repository.findByOrderId(orderId).map(DeliveryDTO::from).orElse(null);
    }

    /** Capacidad restante para una fecha — consultada por MCP `check_delivery_date`. */
    @DgsQuery
    public int deliveryCapacity(@InputArgument String date) {
        return scheduleDelivery.capacityFor(LocalDate.parse(date));
    }

    @DgsMutation
    public DeliveryDTO scheduleDelivery(@InputArgument Map<String, Object> input) {
        String timeSlot = (String) input.get("timeSlot");
        return scheduleDelivery.schedule(new ScheduleDeliveryCommand(
                Long.parseLong(String.valueOf(input.get("orderId"))),
                LocalDate.parse((String) input.get("scheduledDate")),
                timeSlot != null ? timeSlot : "MORNING",
                (String) input.get("address"),
                (String) input.get("notes"),
                (String) input.get("deliveryType"),
                input.get("latitude") instanceof Number n ? n.doubleValue() : null,
                input.get("longitude") instanceof Number n ? n.doubleValue() : null));
    }

    @DgsMutation
    public DeliveryDTO updateDeliveryStatus(@InputArgument long id, @InputArgument String status) {
        return scheduleDelivery.updateStatus(id, DeliveryStatus.valueOf(status));
    }

    @DgsMutation
    public DeliveryDTO rescheduleDelivery(@InputArgument long id, @InputArgument String newDate) {
        return scheduleDelivery.reschedule(id, LocalDate.parse(newDate));
    }
}
