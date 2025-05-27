package com.example.smartirrigationsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;
import java.util.Objects;

@Entity
@Table(name = "SubZones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SubZone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @Column(length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_type_id")
    private PlantType plantType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soil_type_id")
    private SoilType soilType;

    @Column(columnDefinition = "TEXT")
    private String extraInfo;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        SubZone subZone = (SubZone) o;
        return id != null && Objects.equals(id, subZone.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}