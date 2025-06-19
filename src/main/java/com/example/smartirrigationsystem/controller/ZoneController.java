package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.dto.PlannedIrrigationResponse;
import com.example.smartirrigationsystem.dto.SensorDataRequest;
import com.example.smartirrigationsystem.entity.Zone;
import com.example.smartirrigationsystem.repository.ZoneRepository;
import com.example.smartirrigationsystem.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
public class ZoneController {
    private final ZoneService zoneService;
    private final ZoneRepository zoneRepo;
    @GetMapping
    public List<Zone> list() { return zoneService.findAll(); }

    @PutMapping("/{id}")
    public ResponseEntity<Zone> updateZone(
            @PathVariable Integer id,
            @RequestBody Zone incoming
    ) {
        Zone updated = zoneService.updateZone(id, incoming);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/readings")
    public ResponseEntity<PlannedIrrigationResponse> receiveSensorData(@RequestBody SensorDataRequest request) {
        if (request.getControllerUid() == null || request.getSubZones() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sensor data request");
        }
        zoneService.ingestSensorData(request);
        List<PlannedIrrigationResponse.SubZonePlan> subZonePlans = zoneService.calculatePlannedIrrigation(request.getControllerUid());
        PlannedIrrigationResponse response = new PlannedIrrigationResponse(subZonePlans);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Zone> getById(@PathVariable Integer id) {
        Zone zone = zoneService.findById(id);
        return ResponseEntity.ok(zone);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteZone(@PathVariable Integer id) {
        zoneService.deleteZone(id);
        return ResponseEntity.noContent().build();
    }

}
