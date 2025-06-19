package com.example.smartirrigationsystem.service;

import com.example.smartirrigationsystem.dto.PlannedIrrigationResponse;
import com.example.smartirrigationsystem.dto.SensorDataRequest;
import com.example.smartirrigationsystem.entity.*;
import com.example.smartirrigationsystem.repository.IrrigationHistoryRepository;
import com.example.smartirrigationsystem.repository.ManualIrrigationRequestRepository;
import com.example.smartirrigationsystem.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ZoneService {
    private final ZoneRepository zoneRepo;
    private final ManualIrrigationRequestRepository irrigationRequestRepository;
    private final IrrigationHistoryRepository irrigationHistoryRepository;

    public List<Zone> findAll() {
        List<Zone> zoneList = zoneRepo.findAll();
        zoneList.forEach(zone -> {
            zone.getSubZones().forEach(subZone -> {
                subZone.getIrrigationHistoryList().forEach(irrigationHistory -> {
                    boolean hasIssues = false;
                    zone.setHasIssues(hasIssues);
                });
            });
        });
        return zoneList;
    }

    public Zone updateZone(Integer id, Zone incoming) {
        Optional<Zone> optional = zoneRepo.findById(id);
        if (optional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found with id " + id);
        }

        Zone existing = optional.get();
        existing.setName(incoming.getName());
        existing.setLatitude(incoming.getLatitude());
        existing.setLongitude(incoming.getLongitude());
        existing.setExtraInfo(incoming.getExtraInfo());

        return zoneRepo.save(existing);
    }

    @Transactional
    public void ingestSensorData(SensorDataRequest req) {
        // 1. Знаходимо зону за її унікальним контролером
        Zone zone = zoneRepo.findByControllerUid(req.getControllerUid());
        if (zone == null) {
            // Якщо зона ще не створена, створимо її «на льоту»
            zone = new Zone();
            zone.setControllerUid(req.getControllerUid());
            zone = zoneRepo.save(zone);
        }

        // 2. Для кожної підзони в запиті оновлюємо показники
        for (SensorDataRequest.SubzoneData subzoneData : req.getSubZones()) {
            int subzoneIndex = subzoneData.getSubzoneIndex();

            // Якщо підзона з таким індексом ще не існує, створюємо її
            Optional<SubZone> found = zone.getSubZones().stream()
                    .filter(sz -> sz.getSubzoneIndex() == subzoneIndex)
                    .findFirst();

            SubZone subZone;
            if (found.isEmpty()) {
                subZone = new SubZone();
                subZone.setSubzoneIndex(subzoneIndex);
                subZone.setZone(zone);
                zone.getSubZones().add(subZone);
            } else {
                subZone = found.get();
            }

            // 2.1. Додаємо новий запис про дощемір
            RainSensorReading rainReading = new RainSensorReading();
            rainReading.setSubZone(subZone);
            rainReading.setRaining(subzoneData.isRainDetected());
            ZoneId kyivZone = ZoneId.of("Europe/Kyiv");
            rainReading.setRecordedAt(LocalDateTime.now(kyivZone));
            subZone.getRainSensorReadings().add(rainReading);

            // 2.2. Додаємо новий запис про вологість ґрунту
            SoilMoistureReading moistureReading = new SoilMoistureReading();
            moistureReading.setSubZone(subZone);
            moistureReading.setMoisturePercent(subzoneData.getSoilMoisturePercent());
            moistureReading.setRecordedAt(LocalDateTime.now(kyivZone));
            subZone.getSoilMoistureReadings().add(moistureReading);

            // 3. Перевіряємо умови для адаптивного поливу
            PlantType plant = subZone.getPlantType();
            if (plant != null) {
                double currentMoisture = moistureReading.getMoisturePercent();
                int minOptimal = plant.getOptimalMoistureMin();

                // 3.1. Якщо поточна вологість нижче мінімальної межі
                if (currentMoisture < minOptimal) {
                    // 3.2. Перевіряємо, чи зараз не йде дощ
                    boolean isRainingNow = subzoneData.isRainDetected();
                    boolean hasIrrigationIssue = subZone.getHasIrrigationIssue() != null ? subZone.getHasIrrigationIssue() : false;
                    List<ManualIrrigationRequest> manualIrrigationRequests = getPendingIrrigationRequests(subZone.getId());
                    boolean hasPendingRequests = !manualIrrigationRequests.isEmpty();
                    // check using history when last irrigation happened
                    IrrigationHistory lastIrrigationHistory = subZone.getIrrigationHistoryList().stream()
                            .max(Comparator.comparing(IrrigationHistory::getStartTime))
                            .orElse(null);
                    boolean isLastRequestRecent = lastIrrigationHistory != null &&
                            lastIrrigationHistory.getStartTime().isAfter(LocalDateTime.now(kyivZone).minusHours(1));

                    // 3.4. Якщо немає дощу зараз і прогноз не обіцяє опадів найближчу годину
                    if (!isRainingNow && !hasIrrigationIssue && !hasPendingRequests && !isLastRequestRecent) {
                        // Створюємо запис в IrrigationHistory
                        ManualIrrigationRequest irrigationRequest = new ManualIrrigationRequest();
                        irrigationRequest.setSubZone(subZone);
                        irrigationRequest.setRequestedAt(LocalDateTime.now(kyivZone));
                        irrigationRequest.setTriggeredBy(TriggeredBy.valueOf("auto"));
                        irrigationRequest.setDurationSeconds(subZone.getDefaultIrrigationDurationInSeconds());

                        irrigationRequestRepository.save(irrigationRequest);
                    }
                }
            }
        }

        // Зберігаємо всі зміни до об’єктів Zone → SubZone → пов’язані сутності
        zoneRepo.save(zone);
    }

    @Transactional
    public List<PlannedIrrigationResponse.SubZonePlan> calculatePlannedIrrigation(String controllerUid) {
        Zone zone = zoneRepo.findByControllerUid(controllerUid);
        if (zone == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Zone not found with controller UID: " + controllerUid);
        }

        List<PlannedIrrigationResponse.SubZonePlan> subZonePlans = new ArrayList<>();
        for (SubZone subZone : zone.getSubZones()) {
            List<ManualIrrigationRequest> manualIrrigationRequests = getPendingIrrigationRequests(subZone.getId());
            // get last manual irrigation request
            ManualIrrigationRequest lastRequest = manualIrrigationRequests.stream()
                    .max(Comparator.comparing(ManualIrrigationRequest::getRequestedAt))
                    .orElse(null);
            int plannedDuration = 0;
            if (lastRequest != null) {
                // If there is a last request, use its duration
                plannedDuration = lastRequest.getDurationSeconds();
            }
            subZonePlans.add(new PlannedIrrigationResponse.SubZonePlan(subZone.getSubzoneIndex(), plannedDuration));
            // save to irrigation history last irrigation request
            if (lastRequest != null) {
                IrrigationHistory history = new IrrigationHistory();
                history.setSubZone(subZone);
                history.setDurationSeconds(lastRequest.getDurationSeconds());
                history.setTriggeredBy(lastRequest.getTriggeredBy());
                ZoneId kyivZone = ZoneId.of("Europe/Kyiv");
                history.setStartTime(LocalDateTime.now(kyivZone));
                irrigationHistoryRepository.save(history);
            }
            manualIrrigationRequests.forEach(
                    request -> request.setExecuted(true) // Mark all pending requests as executed
            );
        }
        return subZonePlans;
    }

    // get all not executed manual irrigation requests for a subzone for the last day
    public List<ManualIrrigationRequest> getPendingIrrigationRequests(Integer subZoneId) {
        ZoneId kyivZone = ZoneId.of("Europe/Kyiv");
        LocalDateTime oneDayAgo = LocalDateTime.now(kyivZone).minusDays(1);
        return irrigationRequestRepository.findBySubZoneIdAndExecutedFalseAndRequestedAtAfter(subZoneId, oneDayAgo);
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
