package com.carpinteria.business.domain.delivery.model;

/** Value Object — franja horaria de entrega. */
public enum TimeSlot {
    MORNING("08:00–12:00"),
    AFTERNOON("14:00–18:00"),
    EVENING("18:00–21:00");

    private final String label;

    TimeSlot(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static TimeSlot of(String value) {
        if (value == null) return MORNING;
        for (TimeSlot t : values()) {
            if (t.name().equalsIgnoreCase(value)) return t;
        }
        return MORNING;
    }
}
