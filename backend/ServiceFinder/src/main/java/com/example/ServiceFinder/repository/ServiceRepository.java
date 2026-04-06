package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.ServiceEntity;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    Optional<ServiceEntity> findByName(String name);
}