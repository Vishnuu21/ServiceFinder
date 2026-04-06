package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.service.FavouriteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/favourites")
public class FavouriteController {

    private final FavouriteService favouriteService;

    public FavouriteController(FavouriteService favouriteService) {
        this.favouriteService = favouriteService;
    }

    @PostMapping("/{providerId}")
    public ResponseEntity<?> add(@PathVariable Long providerId, Authentication auth) {
        try {
            favouriteService.addFavourite(auth.getName(), providerId);
            return ResponseEntity.ok(Map.of("message", "Added to favourites"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{providerId}")
    public ResponseEntity<?> remove(@PathVariable Long providerId, Authentication auth) {
        try {
            favouriteService.removeFavourite(auth.getName(), providerId);
            return ResponseEntity.ok(Map.of("message", "Removed from favourites"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(Authentication auth) {
        try {
            return ResponseEntity.ok(favouriteService.getMyFavourites(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{providerId}/check")
    public ResponseEntity<?> check(@PathVariable Long providerId, Authentication auth) {
        try {
            return ResponseEntity.ok(Map.of("favourited", favouriteService.isFavourited(auth.getName(), providerId)));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-count")
    public ResponseEntity<?> myFavouriteCount(Authentication auth) {
        try {
            return ResponseEntity.ok(Map.of("count", favouriteService.getMyFavouriteCount(auth.getName())));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my-services")
    public ResponseEntity<?> myServices(Authentication auth) {
        try {
            return ResponseEntity.ok(favouriteService.getMyServices(auth.getName()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
