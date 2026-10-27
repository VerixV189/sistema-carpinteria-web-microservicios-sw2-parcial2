package com.carpinteria.business.infrastructure.persistence.jpa;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class OrderCarpenterId implements Serializable {

    private long orderId;
    private long carpenterId;
}
