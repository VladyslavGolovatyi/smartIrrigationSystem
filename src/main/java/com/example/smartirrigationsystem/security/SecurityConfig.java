package com.example.smartirrigationsystem.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.*;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.*;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.*;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1) BCrypt‐encoder for passwords
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // 2) DaoAuthenticationProvider, inject JpaUserDetailsService directly
    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            JpaUserDetailsService jpaUserDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider auth = new DaoAuthenticationProvider();
        auth.setUserDetailsService(jpaUserDetailsService);
        auth.setPasswordEncoder(passwordEncoder);
        return auth;
    }

    // 3) Main HTTP security configuration
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           DaoAuthenticationProvider authProvider) throws Exception {
        http
                // Enable CORS so React (localhost:3000) can call us
                .cors().and()

                // Disable CSRF for simplicity
                .csrf(csrf -> csrf.disable())

                // Plug in our DaoAuthenticationProvider
                .authenticationProvider(authProvider)

                // Custom formLogin: return 200 on success, 401 on failure
                .formLogin(form -> form
                        .loginProcessingUrl("/login")
                        .successHandler(new AuthenticationSuccessHandler() {
                            @Override
                            public void onAuthenticationSuccess(
                                    HttpServletRequest request,
                                    HttpServletResponse response,
                                    Authentication authentication
                            ) throws IOException {
                                response.setStatus(HttpServletResponse.SC_OK);
                            }
                        })
                        .failureHandler(new AuthenticationFailureHandler() {
                            @Override
                            public void onAuthenticationFailure(
                                    HttpServletRequest request,
                                    HttpServletResponse response,
                                    AuthenticationException exception
                            ) throws IOException {
                                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            }
                        })
                        .permitAll()
                )

                // Logout: return 200 OK on POST /logout
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(new LogoutSuccessHandler() {
                            @Override
                            public void onLogoutSuccess(
                                    HttpServletRequest request,
                                    HttpServletResponse response,
                                    Authentication authentication
                            ) throws IOException {
                                response.setStatus(HttpServletResponse.SC_OK);
                            }
                        })
                        .permitAll()
                )

                // Authorization rules:
                .authorizeHttpRequests(authz -> authz
                        // PUBLIC (no auth needed) for static resources
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()

                        // ADMIN only: /api/users/**
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // VIEWER+ (GET) on /api/zones/**
                        .requestMatchers(HttpMethod.GET, "/api/zones/**")
                        .hasAnyRole("VIEWER","MAINTAINER","ADMIN")

                        // MAINTAINER+ (POST/PUT/DELETE) on /api/zones/**
                        .requestMatchers(HttpMethod.POST, "/api/zones/**")
                        .hasAnyRole("MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/zones/**")
                        .hasAnyRole("MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/zones/**")
                        .hasAnyRole("MAINTAINER","ADMIN")


                        // PlantType
                        .requestMatchers(HttpMethod.GET,  "/api/plant-types/**").hasAnyRole("VIEWER","MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/plant-types/**").hasAnyRole("MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/plant-types/**").hasAnyRole("MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/plant-types/**").hasAnyRole("MAINTAINER","ADMIN")

                        // SoilType
                        .requestMatchers(HttpMethod.GET,  "/api/soil-types/**").hasAnyRole("VIEWER","MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/soil-types/**").hasAnyRole("MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/soil-types/**").hasAnyRole("MAINTAINER","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,"/api/soil-types/**").hasAnyRole("MAINTAINER","ADMIN")

                        // Users (виключно ADMIN)
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // Any other request requires authentication
                        .anyRequest().authenticated()
                )

                // If React calls /api/** without a valid session, return 401 (not a redirect)
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                new AntPathRequestMatcher("/api/**")
                        )
                )

                // Use HTTP session
                .sessionManagement(sess -> sess
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                );
        return http.build();
    }

    // 4) CORS configuration to allow requests from React at localhost:3000
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        cfg.setAllowedOrigins(List.of(
                "https://smart-irrigation-605037215404.us-central1.run.app"
        ));
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("Content-Type","Authorization","X-Requested-With"));
        cfg.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
