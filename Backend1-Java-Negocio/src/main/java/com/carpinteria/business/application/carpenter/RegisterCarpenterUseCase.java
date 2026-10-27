package com.carpinteria.business.application.carpenter;

import com.carpinteria.business.application.carpenter.dto.CarpenterDTO;
import com.carpinteria.business.domain.carpenter.model.Carpenter;
import com.carpinteria.business.domain.carpenter.model.Specialty;
import com.carpinteria.business.domain.carpenter.repository.CarpenterRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/** CU2 — Registrar/gestionar carpintero. */
@Service
public class RegisterCarpenterUseCase {

    private final CarpenterRepository repository;

    public RegisterCarpenterUseCase(CarpenterRepository repository) {
        this.repository = repository;
    }

    public CarpenterDTO register(CreateCarpenterCommand command) {
        Carpenter carpenter = new Carpenter(null, command.name(), command.email(),
                command.phone(), Specialty.of(command.specialty()),
                command.yearsExperience(), command.hourlyRate(), true, null, null);
        return CarpenterDTO.from(repository.save(carpenter));
    }

    public CarpenterDTO update(long id, UpdateCarpenterCommand command) {
        Carpenter c = repository.findById(id).orElse(null);
        if (c == null) return null;
        if (command.name() != null) c.setName(command.name());
        if (command.email() != null) c.setEmail(command.email());
        if (command.phone() != null) c.setPhone(command.phone());
        if (command.specialty() != null) c.setSpecialty(Specialty.of(command.specialty()));
        if (command.yearsExperience() != null) c.setYearsExperience(command.yearsExperience());
        if (command.hourlyRate() != null) c.setHourlyRate(command.hourlyRate());
        if (command.active() != null) c.setActive(command.active());
        return CarpenterDTO.from(repository.save(c));
    }

    public boolean delete(long id) {
        return repository.delete(id);
    }

    public List<CarpenterDTO> all() {
        return repository.findAll().stream().map(CarpenterDTO::from).toList();
    }

    public CarpenterDTO byId(long id) {
        return repository.findById(id).map(CarpenterDTO::from).orElse(null);
    }
}
