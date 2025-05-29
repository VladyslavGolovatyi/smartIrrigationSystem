package com.example.smartirrigationsystem.dto;

import lombok.Data;

import java.util.List;

@Data
public class SensorDataRequest {
    private String controllerUid;
    private List<SubzoneData> subZones;

    @Data
    public static class SubzoneData {
        private int subzoneIndex;
        private int soilMoisturePercent;
        private boolean rainDetected;
    }
}

