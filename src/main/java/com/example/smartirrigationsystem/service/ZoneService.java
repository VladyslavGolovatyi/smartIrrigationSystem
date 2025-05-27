package com.example.smartirrigationsystem.service;

import com.example.smartirrigationsystem.entity.Zone;
import com.example.smartirrigationsystem.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ZoneService {
    private final ZoneRepository zoneRepo;
    public List<Zone> findAll() { return zoneRepo.findAll(); }
}
