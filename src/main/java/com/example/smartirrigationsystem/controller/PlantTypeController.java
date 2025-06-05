// src/main/java/com/example/smartirrigationsystem/controller/PlantTypeController.java
package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.PlantType;
import com.example.smartirrigationsystem.repository.PlantTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/plant-types")
public class PlantTypeController {

    private final PlantTypeRepository plantTypeRepo;

    public PlantTypeController(PlantTypeRepository plantTypeRepo) {
        this.plantTypeRepo = plantTypeRepo;
    }

    /**
     * Повертає весь список PlantType.
     * Доступ: ADMIN, MAINTAINER, VIEWER (щоб можна було дивитися довідник навіть без права змінювати).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('VIEWER','MAINTAINER','ADMIN')")
    public List<PlantType> listAll() {
        return plantTypeRepo.findAll();
    }

    /**
     * Створити новий PlantType.
     * Доступ: MAINTAINER, ADMIN
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MAINTAINER','ADMIN')")
    public ResponseEntity<PlantType> create(@RequestBody PlantType dto) {
        // Проста перевірка: унікальність по назві?
        PlantType saved = plantTypeRepo.save(dto);
        return ResponseEntity.created(URI.create("/api/plant-types/" + saved.getId())).body(saved);
    }

    /**
     * Отримати PlantType за id.
     * Доступ: VIEWER, MAINTAINER, ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('VIEWER','MAINTAINER','ADMIN')")
    public ResponseEntity<PlantType> getOne(@PathVariable Integer id) {
        Optional<PlantType> pt = plantTypeRepo.findById(id);
        return pt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Оновити PlantType (назва, опис, пороги вологості).
     * Доступ: MAINTAINER, ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAINTAINER','ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody PlantType dto
    ) {
        return plantTypeRepo.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            existing.setOptimalMoistureMin(dto.getOptimalMoistureMin());
            existing.setOptimalMoistureMax(dto.getOptimalMoistureMax());
            PlantType saved = plantTypeRepo.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Видалити PlantType.
     * Доступ: MAINTAINER, ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAINTAINER','ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!plantTypeRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        plantTypeRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
