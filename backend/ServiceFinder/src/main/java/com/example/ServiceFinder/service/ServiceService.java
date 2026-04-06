package com.example.ServiceFinder.service;

import com.example.ServiceFinder.entity.ServiceEntity;
import com.example.ServiceFinder.repository.ServiceRepository;

import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository repo;

    public ServiceService(ServiceRepository repo) {
        this.repo = repo;
    }

    public ServiceEntity save(ServiceEntity service) {
        return repo.save(service);
    }

    public ServiceEntity getOrCreate(String name) {
        return repo.findByName(name)
                .orElseGet(() -> repo.save(new ServiceEntity(null, name)));
    }

    public List<ServiceEntity> getAll() {
        return repo.findAll();
    }
}