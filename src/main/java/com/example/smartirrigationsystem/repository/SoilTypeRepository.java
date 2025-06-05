// src/main/java/com/example/smartirrigationsystem/repository/SoilTypeRepository.java
package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.SoilType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SoilTypeRepository extends JpaRepository<SoilType, Integer> {
    // додаткові методи, якщо необхідно
}
