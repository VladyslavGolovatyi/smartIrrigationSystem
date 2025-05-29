// src/main/java/com/example/smartirrigationsystem/dto/SoilMoistureReadingDto.java
package com.example.smartirrigationsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class SoilMoistureReadingDto {
    private LocalDateTime recordedAt;
    private int soilMoisturePercent;
}
