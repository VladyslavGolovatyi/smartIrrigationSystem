// src/main/java/com/example/smartirrigationsystem/service/SubzoneService.java
package com.example.smartirrigationsystem.service;

import com.example.smartirrigationsystem.entity.ManualIrrigationRequest;
import com.example.smartirrigationsystem.entity.SubZone;
import com.example.smartirrigationsystem.entity.SoilMoistureReading;
import com.example.smartirrigationsystem.dto.SoilMoistureReadingDto;
import com.example.smartirrigationsystem.entity.TriggeredBy;
import com.example.smartirrigationsystem.repository.ManualIrrigationRequestRepository;
import com.example.smartirrigationsystem.repository.SubZoneRepository;
import com.example.smartirrigationsystem.repository.SoilMoistureReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubZoneService {

    private final SubZoneRepository subzoneRepo;
    private final SoilMoistureReadingRepository moistureRepo;
    private final ManualIrrigationRequestRepository irrigationRequestRepository;

    /**
     * Fetches the soil‐moisture readings for a given subzone,
     * verifying that it exists and belongs to the expected zone.
     */
    @Transactional(readOnly = true)
    public List<SoilMoistureReadingDto> getSoilReadingsForSubzone(Integer subzoneId) {
        // 1) Load the SubZone and verify its parent Zone ID
        SubZone sz = subzoneRepo.findById(subzoneId)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Subzone not found with ID: " + subzoneId)
                );

        // 2) Fetch readings ordered by recordedAt
        List<SoilMoistureReading> readings =
                moistureRepo.findBySubZoneOrderByRecordedAtAsc(sz);

        // 3) Map to DTOs
        return readings.stream()
                .map(r -> new SoilMoistureReadingDto(r.getRecordedAt(), r.getMoisturePercent()))
                .collect(Collectors.toList());
    }

    /**
     * Finds a SubZone by its ID.
     */
    public SubZone findById(Integer id) {
        return subzoneRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SubZone not found with ID: " + id));
    }

    //trigger manual irrigation
    @Transactional
    public void triggerManualIrrigation(Integer subzoneId) {
        SubZone subZone = findById(subzoneId);
        ManualIrrigationRequest request = new ManualIrrigationRequest();
        request.setSubZone(subZone);
        request.setDurationSeconds(subZone.getDefaultIrrigationDurationInSeconds());
        request.setTriggeredBy(TriggeredBy.manual);
        ZoneId kyivZone = ZoneId.of("Europe/Kyiv");
        request.setRequestedAt(LocalDateTime.now(kyivZone));

        // Save the manual irrigation request (if you have a repository for it)
        irrigationRequestRepository.save(request);
        System.out.println("Triggering manual irrigation for SubZone: " + subZone.getName());
    }

    public SubZone save(SubZone s) {
        return subzoneRepo.save(s);
    }
}
