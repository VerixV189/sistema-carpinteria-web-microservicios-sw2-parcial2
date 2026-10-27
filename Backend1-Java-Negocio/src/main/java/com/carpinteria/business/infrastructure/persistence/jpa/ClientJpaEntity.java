package com.carpinteria.business.infrastructure.persistence.jpa;

import com.carpinteria.business.domain.client.model.Client;
import com.carpinteria.business.domain.client.model.ClientSegment;
import com.carpinteria.business.domain.client.model.ContactInfo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "clients")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClientJpaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String phone;
    private String address;
    private String segment = "REGULAR";

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Client toDomain() {
        return new Client(id, name, new ContactInfo(email, phone, address),
                ClientSegment.valueOf(segment), createdAt, updatedAt);
    }

    public static ClientJpaEntity from(Client c) {
        ClientJpaEntity e = new ClientJpaEntity();
        e.id = c.getId();
        e.name = c.getName();
        e.email = c.getContactInfo().email();
        e.phone = c.getContactInfo().phone();
        e.address = c.getContactInfo().address();
        e.segment = c.getSegment().name();
        e.createdAt = c.getCreatedAt();
        e.updatedAt = c.getUpdatedAt();
        return e;
    }
}
