// src/main/java/com/example/smartirrigationsystem/controller/CurrentUserController.java
package com.example.smartirrigationsystem.controller;

import com.example.smartirrigationsystem.entity.User;
import com.example.smartirrigationsystem.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class CurrentUserController {

    private final UserRepository userRepo;

    public CurrentUserController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> currentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body("Not authenticated");
        }

        String username = authentication.getName();
        // userRepo.findByUsername is Optional<User>
        User user = userRepo.findByUsername(username).orElseThrow();

        // return username + role name
        String roleName = user.getRole().getName(); // e.g. "ROLE_ADMIN"
        return ResponseEntity.ok(Map.of(
                "username", username,
                "role", roleName
        ));
    }
}
