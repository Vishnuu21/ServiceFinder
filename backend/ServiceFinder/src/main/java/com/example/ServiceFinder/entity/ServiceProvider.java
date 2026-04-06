package com.example.ServiceFinder.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private ServiceEntity service;

    private double latitude;
    private double longitude;

    private String phone;

    @Column(columnDefinition = "TEXT")
    private String description;
}