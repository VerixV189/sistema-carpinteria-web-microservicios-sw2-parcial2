package com.carpinteria.business.domain.carpenter.model;

/** Value Object — especialidad del carpintero. */
public enum Specialty {
    GENERAL,
    MUEBLES,
    COCINAS,
    PUERTAS_VENTANAS,
    RESTAURACION,
    TALLER_FINO;

    public static Specialty of(String value) {
        if (value == null) return GENERAL;
        for (Specialty s : values()) {
            if (s.name().equalsIgnoreCase(value)) return s;
        }
        return GENERAL;
    }
}
