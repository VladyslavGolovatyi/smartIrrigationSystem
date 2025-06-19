package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.ManualIrrigationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ManualIrrigationRequestRepository extends JpaRepository<ManualIrrigationRequest, Integer> {
    // findBySubZoneIdAndExecutedFalseAndRequestedAtAfter
    List<ManualIrrigationRequest> findBySubZoneIdAndExecutedFalseAndRequestedAtAfter(
            Integer subZoneId, LocalDateTime requestedAt);
}
