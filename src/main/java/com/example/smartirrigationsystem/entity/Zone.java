package com.example.smartirrigationsystem.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.Hibernate;
import java.util.Objects;

@Entity
@Table(name = "Zones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Zone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    private Double latitude;

    private Double longitude;

    @Column(columnDefinition = "TEXT")
    private String extraInfo;

    @Column(name = "controller_uid", nullable = false, unique = true, length = 100)
    private String controllerUid;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        Zone zone = (Zone) o;
        return id != null && Objects.equals(id, zone.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}