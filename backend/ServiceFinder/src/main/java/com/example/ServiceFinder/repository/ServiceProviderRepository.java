package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.ServiceProvider;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    List<ServiceProvider> findByServiceId(Long serviceId);
    List<ServiceProvider> findByServiceNameIgnoreCase(String name);
}