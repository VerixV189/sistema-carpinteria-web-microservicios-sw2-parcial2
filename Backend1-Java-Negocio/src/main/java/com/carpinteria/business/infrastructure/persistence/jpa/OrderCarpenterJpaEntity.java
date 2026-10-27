package com.carpinteria.business.infrastructure.persistence.jpa;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_carpenters")
@IdClass(OrderCarpenterId.class)
@Getter
@Setter
@NoArgsConstructor
public class OrderCarpenterJpaEntity {

    @Id
    @Column(name = "order_id")
    private long orderId;

    @Id
    @Column(name = "carpenter_id")
    private long carpenterId;
}
