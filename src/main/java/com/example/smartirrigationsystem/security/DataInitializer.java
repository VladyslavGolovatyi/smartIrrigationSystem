// файл: com/example/smartirrigationsystem/security/DataInitializer.java
package com.example.smartirrigationsystem.security;

import com.example.smartirrigationsystem.entity.User;
import com.example.smartirrigationsystem.entity.Role;
import com.example.smartirrigationsystem.repository.UserRepository;
import com.example.smartirrigationsystem.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepo,
            RoleRepository roleRepo,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // 1) Перевіримо, чи є ролі в таблиці. Якщо ні — створимо.
            if (roleRepo.findByName("ROLE_ADMIN").isEmpty()) {
                roleRepo.save(new Role(null, "ROLE_ADMIN"));
            }
            if (roleRepo.findByName("ROLE_MAINTAINER").isEmpty()) {
                roleRepo.save(new Role(null, "ROLE_MAINTAINER"));
            }
            if (roleRepo.findByName("ROLE_VIEWER").isEmpty()) {
                roleRepo.save(new Role(null, "ROLE_VIEWER"));
            }

            // 2) Створимо дефолтного адміністратора, якщо його немає
            if (userRepo.findByUsername("admin").isEmpty()) {
                Role adminRole = roleRepo.findByName("ROLE_ADMIN")
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));
                User admin = new User();
                admin.setUsername("admin");
                // Генеруємо hash пароля, наприклад “admin123”
                admin.setPasswordHash(passwordEncoder.encode("admin123"));
                admin.setRole(adminRole);

                userRepo.save(admin);
                System.out.println("Default admin created: username=admin, password=admin123");
            }
        };
    }
}
