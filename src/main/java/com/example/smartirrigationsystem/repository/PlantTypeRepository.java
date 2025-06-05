package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.PlantType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlantTypeRepository extends JpaRepository<PlantType, Integer> {
    // додаткові методи, якщо необхідно
}
