package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.ManualIrrigationRequest;
import com.example.smartirrigationsystem.entity.SoilMoistureReading;
import com.example.smartirrigationsystem.entity.SubZone;
import com.example.smartirrigationsystem.repository.SoilMoistureReadingRepository;
import com.example.smartirrigationsystem.repository.SubZoneRepository;
import com.example.smartirrigationsystem.service.IrrigationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subzones")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:3000")
public class SubZoneController {
    private final SubZoneRepository subZoneRepo;
    private final IrrigationService irrigationService;
    private final SoilMoistureReadingRepository moistureRepo;

    @GetMapping("/{id}")
    public SubZone get(@PathVariable Integer id) {
        return subZoneRepo.findById(id).orElseThrow();
    }

    @PostMapping("/{id}/irrigate")
    public ManualIrrigationRequest irrigate(
            @PathVariable Integer id,
            @RequestParam int durationSec) {
        return irrigationService.request(id, durationSec);
    }

    @GetMapping("/{id}/moisture-history")
    public List<SoilMoistureReading> moistureHistory(@PathVariable Integer id) {
        return moistureRepo.findTop20BySubZoneIdOrderByRecordedAtDesc(id);
    }
}
