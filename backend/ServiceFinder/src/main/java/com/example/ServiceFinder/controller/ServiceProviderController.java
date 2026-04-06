package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.dto.response.ProviderResponse;
import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.service.ServiceProviderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/providers")
public class ServiceProviderController {

    private final ServiceProviderService service;

    public ServiceProviderController(ServiceProviderService service) {
        this.service = service;
    }

    // Add provider
    @PostMapping
    public ServiceProvider addProvider(@RequestBody ServiceProvider provider) {
        return service.save(provider);
    }

    // Get nearest providers
  @GetMapping("/nearby")
public List<ProviderResponse> getNearby(
        @RequestParam double lat,
        @RequestParam double lon) {
    return service.findNearbyAll(lat, lon);
}

    @GetMapping("/nearby-by-service")
    public List<ProviderResponse> getNearbyByService(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam Long serviceId) {
        return service.findNearbyByService(lat, lon, serviceId);
    }

    @GetMapping("/search")
    public List<ProviderResponse> search(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam String serviceName) {
        return service.findNearbyByServiceName(lat, lon, serviceName);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.findById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id, Authentication auth) {
        try {
            service.deleteService(auth.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Service deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) {
        try {
            ServiceProvider updated = service.updateService(auth.getName(), id, body);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}