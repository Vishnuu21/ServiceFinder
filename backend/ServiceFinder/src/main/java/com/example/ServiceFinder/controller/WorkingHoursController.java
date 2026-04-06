package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.dto.request.WorkingHoursRequest;
import com.example.ServiceFinder.dto.response.WorkingHoursResponse;
import com.example.ServiceFinder.service.WorkingHoursService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/working-hours")
public class WorkingHoursController {

    private final WorkingHoursService service;

    public WorkingHoursController(WorkingHoursService service) {
        this.service = service;
    }

    // get working hours for a provider (public)
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<WorkingHoursResponse>> getHours(@PathVariable Long providerId) {
        return ResponseEntity.ok(service.getWorkingHours(providerId));
    }

    // save/update working hours (provider only)
    @PostMapping
    public ResponseEntity<?> saveHours(@RequestBody WorkingHoursRequest request,
                                        Authentication auth) {
        try {
            return ResponseEntity.ok(service.saveWorkingHours(auth.getName(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // check if provider is available right now (public)
    @GetMapping("/available/{providerId}")
    public ResponseEntity<Map<String, Boolean>> isAvailable(@PathVariable Long providerId) {
        return ResponseEntity.ok(Map.of("available", service.isAvailable(providerId)));
    }
}
