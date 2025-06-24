package com.example.smartirrigationsystem.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.Objects;
import java.time.LocalDateTime;

@Entity
@Table(name = "SoilMoistureReadings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SoilMoistureReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subzone_id")
    @JsonBackReference
    @OnDelete(action = OnDeleteAction.SET_NULL)
    private SubZone subZone;

    @Column(name = "moisture_percent", nullable = false)
    private Integer moisturePercent;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        SoilMoistureReading that = (SoilMoistureReading) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }

    public SoilMoistureReading(SubZone subZone, Integer moisturePercent, LocalDateTime recordedAt) {
        this.subZone = subZone;
        this.moisturePercent = moisturePercent;
        this.recordedAt = recordedAt;
    }
}