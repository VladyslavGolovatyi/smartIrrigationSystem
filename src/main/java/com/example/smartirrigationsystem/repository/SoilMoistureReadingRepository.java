package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.SoilMoistureReading;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SoilMoistureReadingRepository extends JpaRepository<SoilMoistureReading, Integer> {
    List<SoilMoistureReading> findTop20BySubZoneIdOrderByRecordedAtDesc(Integer subZoneId);
}
