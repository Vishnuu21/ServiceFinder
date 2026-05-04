package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.ServiceProvider;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;

public interface ServiceProviderRepository extends JpaRepository<ServiceProvider, Long> {

    List<ServiceProvider> findByServiceId(Long serviceId);
    List<ServiceProvider> findByServiceNameIgnoreCase(String name);

    @Query("SELECT COUNT(DISTINCT LOWER(p.name)) FROM ServiceProvider p")
    long countDistinctProviders();
}