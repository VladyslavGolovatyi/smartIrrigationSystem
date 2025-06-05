package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.dto.SoilMoistureReadingDto;
import com.example.smartirrigationsystem.entity.PlantType;
import com.example.smartirrigationsystem.entity.SoilType;
import com.example.smartirrigationsystem.entity.SubZone;
import com.example.smartirrigationsystem.repository.PlantTypeRepository;
import com.example.smartirrigationsystem.repository.SoilTypeRepository;
import com.example.smartirrigationsystem.service.SubZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/zones/{zoneId}/subzones")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:3000")
public class SubZoneController {
    private final SubZoneService subZoneService;
    private final PlantTypeRepository plantTypeRepo;
    private final SoilTypeRepository soilTypeRepo;

    @GetMapping("/{id}")
    public SubZone get(@PathVariable Integer id) {
        return subZoneService.findById(id);
    }

    // --- new PUT endpoint for editing a subzone ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateSubZone(
            @PathVariable Integer zoneId,
            @PathVariable Integer id,
            @RequestBody SubZone incoming  // we expect JSON with fields: name, plantType.id, soilType.id, extraInfo, defaultIrrigationDurationInSeconds
    ) {
        // 1) load existing SubZone
        SubZone existing = subZoneService.findById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        // 2) Update simple fields
        existing.setName(incoming.getName());
        existing.setExtraInfo(incoming.getExtraInfo());
        existing.setDefaultIrrigationDurationInSeconds(incoming.getDefaultIrrigationDurationInSeconds());

        // 3) Update plantType if provided
        if (incoming.getPlantType() != null && incoming.getPlantType().getId() != null) {
            Optional<PlantType> ptOpt = plantTypeRepo.findById(incoming.getPlantType().getId());
            if (ptOpt.isPresent()) {
                existing.setPlantType(ptOpt.get());
            } else {
                return ResponseEntity.badRequest()
                        .body("Invalid plantType ID: " + incoming.getPlantType().getId());
            }
        } else {
            existing.setPlantType(null);
        }

        // 4) Update soilType if provided
        if (incoming.getSoilType() != null && incoming.getSoilType().getId() != null) {
            Optional<SoilType> stOpt = soilTypeRepo.findById(incoming.getSoilType().getId());
            if (stOpt.isPresent()) {
                existing.setSoilType(stOpt.get());
            } else {
                return ResponseEntity.badRequest()
                        .body("Invalid soilType ID: " + incoming.getSoilType().getId());
            }
        } else {
            existing.setSoilType(null);
        }

        // 5) Save back
        SubZone saved = subZoneService.save(existing);
        return ResponseEntity.ok(saved);
    }

    // existing endpoint(s):
    @GetMapping("/{id}/soil-readings")
    public List<SoilMoistureReadingDto> getSoilMoistureReadings(@PathVariable Integer id) {
        return subZoneService.getSoilReadingsForSubzone(id);
    }
}
