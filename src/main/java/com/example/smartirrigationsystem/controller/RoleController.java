package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.Role;
import com.example.smartirrigationsystem.repository.RoleRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {
    private final RoleRepository roleRepo;
    public RoleController(RoleRepository roleRepo) {
        this.roleRepo = roleRepo;
    }
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // або хоча б MAINTAINER
    public List<Role> listRoles() {
        return roleRepo.findAll();
    }
}
