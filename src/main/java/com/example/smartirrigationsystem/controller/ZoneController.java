package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.Zone;
import com.example.smartirrigationsystem.service.ZoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/zones")
@RequiredArgsConstructor
@CrossOrigin("http://localhost:3000")
public class ZoneController {
    private final ZoneService zoneService;
    @GetMapping
    public List<Zone> list() { return zoneService.findAll(); }
}
