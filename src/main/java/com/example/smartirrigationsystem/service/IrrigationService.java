package com.example.smartirrigationsystem.service;

import com.example.smartirrigationsystem.entity.ManualIrrigationRequest;
import com.example.smartirrigationsystem.entity.SubZone;
import com.example.smartirrigationsystem.repository.ManualIrrigationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IrrigationService {
    private final ManualIrrigationRequestRepository reqRepo;
    public ManualIrrigationRequest request(Integer subZoneId, int durationSec) {
        ManualIrrigationRequest r = new ManualIrrigationRequest();
        r.setSubZone(new SubZone(subZoneId,null,null,null,null, null));
        r.setDurationSeconds(durationSec);
        r.setExecuted(false);
        return reqRepo.save(r);
    }
}
