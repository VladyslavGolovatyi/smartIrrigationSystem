package com.example.smartirrigationsystem.dto;

import java.util.List;

public class PlannedIrrigationResponse {
    private List<SubZonePlan> subZones;

    public PlannedIrrigationResponse() {}

    public PlannedIrrigationResponse(List<SubZonePlan> subZones) {
        this.subZones = subZones;
    }

    public List<SubZonePlan> getSubZones() {
        return subZones;
    }

    public void setSubZones(List<SubZonePlan> subZones) {
        this.subZones = subZones;
    }

    public static class SubZonePlan {
        private int subzoneIndex;
        private int plannedIrrigationDurationInSeconds;

        public SubZonePlan() {}

        public SubZonePlan(int subzoneIndex, int duration) {
            this.subzoneIndex = subzoneIndex;
            this.plannedIrrigationDurationInSeconds = duration;
        }

        public int getSubzoneIndex() {
            return subzoneIndex;
        }

        public void setSubzoneIndex(int subzoneIndex) {
            this.subzoneIndex = subzoneIndex;
        }

        public int getPlannedIrrigationDurationInSeconds() {
            return plannedIrrigationDurationInSeconds;
        }

        public void setPlannedIrrigationDurationInSeconds(int plannedIrrigationDurationInSeconds) {
            this.plannedIrrigationDurationInSeconds = plannedIrrigationDurationInSeconds;
        }
    }
}
