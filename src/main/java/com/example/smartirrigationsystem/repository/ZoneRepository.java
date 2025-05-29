package com.example.smartirrigationsystem.repository;

import com.example.smartirrigationsystem.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ZoneRepository extends JpaRepository<Zone, Integer> {
    Zone findByControllerUid(String controllerUid);
}

