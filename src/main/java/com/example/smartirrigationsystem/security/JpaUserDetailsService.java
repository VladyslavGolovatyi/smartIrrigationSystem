// файл: com/example/smartirrigationsystem/security/JpaUserDetailsService.java
package com.example.smartirrigationsystem.security;

import com.example.smartirrigationsystem.entity.User;
import com.example.smartirrigationsystem.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;

@Service
public class JpaUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public JpaUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Знаходимо користувача в БД
        User appUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Витягуємо назву ролі (має бути вже з префіксом "ROLE_")
        String roleName = appUser.getRole().getName();

        // Перетворюємо в GrantedAuthority
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority(roleName);

        // Будуємо власний UserDetails через клас Spring Security
        return org.springframework.security.core.userdetails.User
                .builder()
                .username(appUser.getUsername())
                .password(appUser.getPasswordHash())
                .authorities(Collections.singleton(authority))
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(false)
                .build();
    }
}
