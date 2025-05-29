package com.example.smartirrigationsystem.service;

import com.example.smartirrigationsystem.dto.SensorDataRequest;
import com.example.smartirrigationsystem.entity.RainSensorReading;
import com.example.smartirrigationsystem.entity.SoilMoistureReading;
import com.example.smartirrigationsystem.entity.SubZone;
import com.example.smartirrigationsystem.entity.Zone;
import com.example.smartirrigationsystem.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ZoneService {
    private final ZoneRepository zoneRepo;
    public List<Zone> findAll() { return zoneRepo.findAll(); }

    @Transactional
    public void ingestSensorData(SensorDataRequest req) {
        Zone zone = zoneRepo.findByControllerUid(req.getControllerUid());
        if (zone == null) {
            zone = zoneRepo.save(new Zone(req.getControllerUid()));
        }
        for (SensorDataRequest.SubzoneData subzoneData : req.getSubZones()) {
            int subzoneIndex = subzoneData.getSubzoneIndex();

            if (zone.getSubZones().stream().filter(subZoneTmp -> subZoneTmp.getSubzoneIndex() == subzoneIndex).findFirst().isEmpty()) {
                zone.getSubZones().add(new SubZone(
                        subzoneData.getSubzoneIndex(),
                        zone
                ));
            }
            SubZone subZone = zone.getSubZones().stream().filter(subZoneTmp -> subZoneTmp.getSubzoneIndex() == subzoneIndex)
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("SubZone not found for index: " + subzoneIndex));
            subZone.getRainSensorReadings().add(new RainSensorReading(
                    subZone,
                    subzoneData.isRainDetected(),
                    LocalDateTime.now()));

            subZone.getSoilMoistureReadings().add(new SoilMoistureReading(
                    subZone,
                    subzoneData.getSoilMoisturePercent(),
                    LocalDateTime.now()));
        }
    }

    // Method to find a zone by its id
    public Zone findById(Integer id) {
        return zoneRepo.findById(id)
                .orElseThrow(() -> new IllegalStateException("Zone not found with id: " + id));
    }

    // delete zone
    public void deleteZone(Integer id) {
        Zone zone = findById(id);
        zoneRepo.delete(zone);
    }
}
