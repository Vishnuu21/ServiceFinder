package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.dto.request.ReviewRequest;
import com.example.ServiceFinder.dto.response.ReviewResponse;
import com.example.ServiceFinder.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest request,
                                        Authentication auth) {
        try {
            return ResponseEntity.ok(reviewService.addReview(auth.getName(), request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editReview(@PathVariable Long id,
                                         @RequestBody ReviewRequest request,
                                         Authentication auth) {
        try {
            return ResponseEntity.ok(reviewService.editReview(auth.getName(), id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id,
                                           Authentication auth) {
        try {
            reviewService.deleteReview(auth.getName(), id);
            return ResponseEntity.ok(Map.of("message", "Review deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponse>> getReviews(@PathVariable Long providerId,
                                                            Authentication auth) {
        String email = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(reviewService.getReviews(providerId, email));
    }
}
