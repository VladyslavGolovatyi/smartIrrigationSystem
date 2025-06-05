// src/main/java/com/example/smartirrigationsystem/controller/UserManagementController.java
package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.Role;
import com.example.smartirrigationsystem.entity.User;
import com.example.smartirrigationsystem.repository.RoleRepository;
import com.example.smartirrigationsystem.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final PasswordEncoder passwordEncoder;

    public UserManagementController(UserRepository userRepo,
                                    RoleRepository roleRepo,
                                    PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Повернути всіх користувачів
     * Доступ: ADMIN
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<User> listAll() {
        return userRepo.findAll();
    }

    /**
     * Створити нового користувача з роллю
     * Доступ: ADMIN
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody User dto) {
        // Перевірити, що юзернейм унікальний
        if (userRepo.findByUsername(dto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already in use");
        }

        // Захешувати пароль
        dto.setPasswordHash(passwordEncoder.encode(dto.getPasswordHash()));

        // Якщо у dto передано ID ролі, забрати роль з БД
        Optional<Role> r = roleRepo.findById(dto.getRole().getId());
        if (r.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid role ID");
        }
        dto.setRole(r.get());

        User saved = userRepo.save(dto);
        return ResponseEntity.created(URI.create("/api/users/" + saved.getId())).body(saved);
    }

    /**
     * Отримати користувача за id
     * Доступ: ADMIN
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getOne(@PathVariable Integer id) {
        Optional<User> u = userRepo.findById(id);
        return u.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Оновити користувача (username, роль, пароль)
     * Доступ: ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody User dto
    ) {
        return userRepo.findById(id).map(existing -> {
            existing.setUsername(dto.getUsername());
            // оновити роль
            Optional<Role> r = roleRepo.findById(dto.getRole().getId());
            if (r.isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid role ID");
            }
            existing.setRole(r.get());
            // якщо прислано новий пароль, захешувати
            if (dto.getPasswordHash() != null && !dto.getPasswordHash().isBlank()) {
                existing.setPasswordHash(passwordEncoder.encode(dto.getPasswordHash()));
            }
            User saved = userRepo.save(existing);
            return ResponseEntity.ok(saved);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Видалити користувача
     * Доступ: ADMİN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!userRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
