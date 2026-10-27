package com.carpinteria.business.domain.order.valueobject;

/** Value Object — dimensiones del mueble en metros. */
public record Dimensions(double lengthM, double widthM, double heightM) {

    public double getVolumeM3() {
        return lengthM * widthM * heightM;
    }
}
