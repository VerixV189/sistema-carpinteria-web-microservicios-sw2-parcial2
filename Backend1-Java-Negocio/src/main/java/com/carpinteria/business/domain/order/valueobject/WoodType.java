package com.carpinteria.business.domain.order.valueobject;

/** Value Object — tipo de madera con costo relativo. */
public enum WoodType {
    GENERIC(1.0),
    PINO(0.8),
    MELAMINA(0.5),
    CEDRO(1.4),
    ROBLE(1.7),
    MARA(2.2);

    private final double costFactor;

    WoodType(double costFactor) {
        this.costFactor = costFactor;
    }

    public double getCostFactor() {
        return costFactor;
    }

    public static WoodType of(String value) {
        if (value == null) return GENERIC;
        for (WoodType w : values()) {
            if (w.name().equalsIgnoreCase(value)) return w;
        }
        return GENERIC;
    }
}
