// src/main/java/com/example/smartirrigationsystem/repository/SoilMoistureReadingRepository.java
package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.SoilMoistureReading;
import com.example.smartirrigationsystem.entity.SubZone;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SoilMoistureReadingRepository
        extends JpaRepository<SoilMoistureReading, Integer> {

    // Custom finder to get readings in chronological order
    List<SoilMoistureReading> findBySubZoneOrderByRecordedAtAsc(SubZone subZone);
}
