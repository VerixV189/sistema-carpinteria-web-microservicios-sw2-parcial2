package com.carpinteria.business.application.delivery;

import com.carpinteria.business.application.delivery.dto.DeliveryDTO;
import com.carpinteria.business.domain.client.service.DomainException;
import com.carpinteria.business.domain.delivery.model.DeliverySchedule;
import com.carpinteria.business.domain.delivery.model.DeliveryStatus;
import com.carpinteria.business.domain.delivery.model.DeliveryType;
import com.carpinteria.business.domain.delivery.model.TimeSlot;
import com.carpinteria.business.domain.delivery.repository.DeliveryRepository;
import com.carpinteria.business.domain.order.model.Order;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import com.carpinteria.business.domain.order.service.OrderDomainService;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/** CU4 — Administrar fecha de entrega. */
@Service
public class ScheduleDeliveryUseCase {

    private final DeliveryRepository repository;
    private final OrderRepository orderRepository;
    private final OrderDomainService orderDomainService;

    public ScheduleDeliveryUseCase(DeliveryRepository repository,
                                   OrderRepository orderRepository,
                                   OrderDomainService orderDomainService) {
        this.repository = repository;
        this.orderRepository = orderRepository;
        this.orderDomainService = orderDomainService;
    }

    public DeliveryDTO schedule(ScheduleDeliveryCommand command) {
        int used = repository.countByDate(command.scheduledDate());
        if (!orderDomainService.hasDeliveryCapacity(command.scheduledDate(), used)) {
            throw new DomainException("Sin capacidad de entrega el " + command.scheduledDate()
                    + " (máx. " + OrderDomainService.MAX_DELIVERIES_PER_DAY + "/día)");
        }
        // Preferencia del pedido como fallback: tipo, dirección y GPS elegidos
        // por el cliente viajan de la cotización → pedido → entrega.
        Order order = orderRepository.findById(command.orderId()).orElse(null);
        DeliveryType type = command.deliveryType() != null
                ? DeliveryType.of(command.deliveryType())
                : (order != null ? order.getDeliveryType() : DeliveryType.DELIVERY);
        String address = command.address() != null ? command.address()
                : (order != null ? order.getDeliveryAddress() : null);
        Double lat = command.latitude() != null ? command.latitude()
                : (order != null ? order.getDeliveryLat() : null);
        Double lng = command.longitude() != null ? command.longitude()
                : (order != null ? order.getDeliveryLng() : null);
        DeliverySchedule delivery = new DeliverySchedule(null, command.orderId(),
                command.scheduledDate(), TimeSlot.of(command.timeSlot()),
                address, null, command.notes(), type, lat, lng);
        return DeliveryDTO.from(repository.save(delivery));
    }

    public DeliveryDTO updateStatus(long id, DeliveryStatus status) {
        DeliverySchedule d = repository.findById(id).orElse(null);
        if (d == null) return null;
        d.setStatus(status);
        return DeliveryDTO.from(repository.save(d));
    }

    public DeliveryDTO reschedule(long id, LocalDate newDate) {
        DeliverySchedule d = repository.findById(id).orElse(null);
        if (d == null) return null;
        d.setScheduledDate(newDate);
        d.setStatus(DeliveryStatus.RESCHEDULED);
        return DeliveryDTO.from(repository.save(d));
    }

    public int capacityFor(LocalDate date) {
        return OrderDomainService.MAX_DELIVERIES_PER_DAY - repository.countByDate(date);
    }
}
