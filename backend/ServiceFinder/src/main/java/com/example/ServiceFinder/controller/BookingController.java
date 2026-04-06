package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.dto.request.BookingRequest;
import com.example.ServiceFinder.dto.response.BookingResponse;
import com.example.ServiceFinder.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request,
                                            Authentication auth) {
        try {
            return ResponseEntity.ok(bookingService.createBooking(auth.getName(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyBookings(Authentication auth) {
        try {
            List<BookingResponse> bookings;
            // check role from authorities
            boolean isProvider = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_PROVIDER"));
            if (isProvider) {
                bookings = bookingService.getProviderBookings(auth.getName());
            } else {
                bookings = bookingService.getCustomerBookings(auth.getName());
            }
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           Authentication auth) {
        try {
            return ResponseEntity.ok(bookingService.updateStatus(auth.getName(), id, body.get("status")));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
