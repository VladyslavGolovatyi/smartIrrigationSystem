package com.example.smartirrigationsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;
import java.util.Objects;
import java.time.LocalDateTime;

@Entity
@Table(name = "RainSensorReadings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RainSensorReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subzone_id", nullable = false)
    private SubZone subZone;

    @Column(name = "is_raining", nullable = false)
    private Boolean raining;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        RainSensorReading that = (RainSensorReading) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}