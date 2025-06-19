package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.IrrigationHistory;
import com.example.smartirrigationsystem.entity.PlantType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IrrigationHistoryRepository extends JpaRepository<IrrigationHistory, Integer> {
    // додаткові методи, якщо необхідно
}
