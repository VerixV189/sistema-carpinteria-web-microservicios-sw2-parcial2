package com.carpinteria.business.domain.delivery.model;

/** Value Object — modalidad de entrega elegida por el cliente. */
public enum DeliveryType {
    /** El cliente recoge el mueble en el taller. */
    PICKUP,
    /** El taller envía el mueble a la ubicación del cliente (GPS/dirección). */
    DELIVERY;

    public static DeliveryType of(String value) {
        if (value == null) return DELIVERY;
        for (DeliveryType t : values()) {
            if (t.name().equalsIgnoreCase(value)) return t;
        }
        return DELIVERY;
    }
}
