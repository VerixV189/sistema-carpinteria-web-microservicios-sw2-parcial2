package com.carpinteria.business.infrastructure.rest;

import com.carpinteria.business.application.order.UpdateOrderStatusUseCase;
import com.carpinteria.business.application.order.dto.OrderResponse;
import com.carpinteria.business.domain.delivery.repository.DeliveryRepository;
import com.carpinteria.business.domain.order.model.OrderStatus;
import com.carpinteria.business.domain.order.repository.OrderRepository;
import com.carpinteria.business.domain.order.service.OrderDomainService;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Adaptador REST (inter-service) — para que otros servicios consulten
 * sin pasar por GraphQL (p. ej. ai-service MCP tool `check_delivery_date`).
 */
@RestController
@RequestMapping("/api/internal")
public class OrderRestController {

    private final OrderRepository orderRepository;
    private final DeliveryRepository deliveryRepository;
    private final UpdateOrderStatusUseCase updateOrderStatus;

    public OrderRestController(OrderRepository orderRepository,
                               DeliveryRepository deliveryRepository,
                               UpdateOrderStatusUseCase updateOrderStatus) {
        this.orderRepository = orderRepository;
        this.deliveryRepository = deliveryRepository;
        this.updateOrderStatus = updateOrderStatus;
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable long id) {
        return orderRepository.findById(id)
                .map(o -> ResponseEntity.ok(OrderResponse.from(o)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/orders")
    public List<OrderResponse> listOrders(@RequestParam(required = false) String status) {
        return orderRepository.findAll(status != null ? OrderStatus.valueOf(status) : null)
                .stream().map(OrderResponse::from).toList();
    }

    /** Consultado por el agente MCP: ¿hay capacidad para entregar en `date`? */
    @GetMapping("/delivery/capacity")
    public Map<String, Object> deliveryCapacity(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        int scheduled = deliveryRepository.countByDate(date);
        return Map.of(
                "date", date.toString(),
                "scheduled", scheduled,
                "maxPerDay", OrderDomainService.MAX_DELIVERIES_PER_DAY,
                "available", OrderDomainService.MAX_DELIVERIES_PER_DAY - scheduled,
                "hasCapacity", scheduled < OrderDomainService.MAX_DELIVERIES_PER_DAY);
    }

    @PostMapping("/orders/{id}/status")
    public ResponseEntity<OrderResponse> setStatus(@PathVariable long id,
                                                   @RequestBody Map<String, String> body) {
        OrderStatus status = OrderStatus.valueOf(body.getOrDefault("status", "PENDING"));
        OrderResponse updated = updateOrderStatus.updateStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }
}
