package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.ManualIrrigationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ManualIrrigationRequestRepository extends JpaRepository<ManualIrrigationRequest, Integer> {}
