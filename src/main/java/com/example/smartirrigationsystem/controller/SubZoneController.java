package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.dto.SoilMoistureReadingDto;
import com.example.smartirrigationsystem.entity.SoilMoistureReading;
import com.example.smartirrigationsystem.entity.SubZone;
import com.example.smartirrigationsystem.repository.SoilMoistureReadingRepository;
import com.example.smartirrigationsystem.service.IrrigationService;
import com.example.smartirrigationsystem.service.SubZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/zones/{zoneId}/subzones")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:3000")
public class SubZoneController {
    private final SubZoneService subZoneService;
    private final IrrigationService irrigationService;
    private final SoilMoistureReadingRepository moistureRepo;

    @GetMapping("/{id}")
    public SubZone get(@PathVariable Integer id) {
        return subZoneService.findById(id);
    }

    // get soil moisture readings for a subzone
    @GetMapping("/{id}/soil-readings")
    public List<SoilMoistureReadingDto> getSoilMoistureReadings(@PathVariable Integer id) {
        return subZoneService.getSoilReadingsForSubzone(id);
    }

}
