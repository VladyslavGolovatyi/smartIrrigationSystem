package com.example.smartirrigationsystem.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;

import java.util.ArrayList;
import java.util.List;
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
    @JsonBackReference
    private Zone zone;

    @Column(length = 100)
    private String name;

    @Column(nullable = false)
    private Integer subzoneIndex;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plant_type_id")
    private PlantType plantType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "soil_type_id")
    private SoilType soilType;

    @Column(columnDefinition = "TEXT")
    private String extraInfo;

    @OneToMany(mappedBy = "subZone", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SoilMoistureReading> soilMoistureReadings = new ArrayList<>();

    @OneToMany(mappedBy = "subZone", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<RainSensorReading> rainSensorReadings = new ArrayList<>();

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

    public SubZone(Integer subzoneIndex, Zone zone) {
        this.subzoneIndex = subzoneIndex;
        this.zone = zone;
    }
}