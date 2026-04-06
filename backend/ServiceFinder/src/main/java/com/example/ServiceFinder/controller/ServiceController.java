package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.entity.ServiceEntity;
import com.example.ServiceFinder.service.ServiceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServiceController {

    private final ServiceService service;

    public ServiceController(ServiceService service) {
        this.service = service;
    }

    // Add new service (Plumber, Electrician)
    @PostMapping
    public ServiceEntity addService(@RequestBody ServiceEntity s) {
        return service.save(s);
    }

    @PostMapping("/get-or-create")
    public ServiceEntity getOrCreate(@RequestBody ServiceEntity s) {
        return service.getOrCreate(s.getName());
    }

    // Get all services
    @GetMapping
    public List<ServiceEntity> getAllServices() {
        return service.getAll();
    }
}