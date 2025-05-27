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
@Table(name = "IrrigationHistory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IrrigationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subzone_id", nullable = false)
    private SubZone subZone;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "triggered_by", nullable = false)
    @Enumerated(EnumType.STRING)
    private TriggeredBy triggeredBy;

    public enum TriggeredBy {
        auto, manual
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        IrrigationHistory that = (IrrigationHistory) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}