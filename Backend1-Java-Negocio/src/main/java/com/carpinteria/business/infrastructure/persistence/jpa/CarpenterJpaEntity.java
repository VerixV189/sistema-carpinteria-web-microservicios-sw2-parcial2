package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.carpenter.model.Carpenter;
import com.carpinteria.business.domain.carpenter.model.Specialty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "carpenters")
@Getter
@Setter
@NoArgsConstructor
public class CarpenterJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String specialty = "GENERAL";

    @Column(name = "years_experience")
    private int yearsExperience;

    @Column(name = "hourly_rate")
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    private boolean active = true;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Carpenter toDomain() {
        return new Carpenter(id, name, email, phone, Specialty.of(specialty),
                yearsExperience, hourlyRate.doubleValue(), active, createdAt, updatedAt);
    }

    public static CarpenterJpaEntity from(Carpenter c) {
        CarpenterJpaEntity e = new CarpenterJpaEntity();
        e.id = c.getId();
        e.name = c.getName();
        e.email = c.getEmail();
        e.phone = c.getPhone();
        e.specialty = c.getSpecialty().name();
        e.yearsExperience = c.getYearsExperience();
        e.hourlyRate = BigDecimal.valueOf(c.getHourlyRate());
        e.active = c.isActive();
        e.createdAt = c.getCreatedAt();
        e.updatedAt = c.getUpdatedAt();
        return e;
    }
}
