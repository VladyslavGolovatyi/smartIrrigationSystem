// src/main/java/com/example/smartirrigationsystem/controller/SoilTypeController.java
package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.SoilType;
import com.example.smartirrigationsystem.repository.SoilTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/soil-types")
public class SoilTypeController {

    private final SoilTypeRepository soilTypeRepo;

    public SoilTypeController(SoilTypeRepository soilTypeRepo) {
        this.soilTypeRepo = soilTypeRepo;
    }

    /**
     * Повернути весь список SoilType.
     * Доступ: VIEWER, MAINTAINER, ADMIN
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('VIEWER','MAINTAINER','ADMIN')")
    public List<SoilType> listAll() {
        return soilTypeRepo.findAll();
    }

    /**
     * Створити новий SoilType
     * Доступ: MAINTAINER, ADMIN
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('MAINTAINER','ADMIN')")
    public ResponseEntity<SoilType> create(@RequestBody SoilType dto) {
        SoilType saved = soilTypeRepo.save(dto);
        return ResponseEntity.created(URI.create("/api/soil-types/" + saved.getId())).body(saved);
    }

    /**
     * Отримати SoilType за id
     * Доступ: VIEWER, MAINTAINER, ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('VIEWER','MAINTAINER','ADMIN')")
    public ResponseEntity<SoilType> getOne(@PathVariable Integer id) {
        Optional<SoilType> st = soilTypeRepo.findById(id);
        return st.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Оновити існуючий SoilType
     * Доступ: MAINTAINER, ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAINTAINER','ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody SoilType dto
    ) {
        return soilTypeRepo.findById(id).map(existing -> {
            existing.setName(dto.getName());
            existing.setDescription(dto.getDescription());
            SoilType saved = soilTypeRepo.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Видалити SoilType
     * Доступ: MAINTAINER, ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MAINTAINER','ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!soilTypeRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        soilTypeRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
