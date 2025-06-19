package com.example.smartirrigationsystem.entity;

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
@Table(name = "ManualIrrigationRequests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ManualIrrigationRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subzone_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private SubZone subZone;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    private Boolean executed = false;

    @Enumerated(EnumType.STRING)
    private TriggeredBy triggeredBy;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        ManualIrrigationRequest that = (ManualIrrigationRequest) o;
        return id != null && Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}