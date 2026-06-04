package com.example.ServiceFinder.controller;

import com.example.ServiceFinder.entity.ServiceEntity;
import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@SuppressWarnings("null")
@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserRepository userRepo;
    private final ServiceProviderRepository providerRepo;
    private final ServiceRepository serviceRepo;
    private final BookingRepository bookingRepo;
    private final ReviewRepository reviewRepo;
    private final FavouriteRepository favouriteRepo;
    private final WorkingHoursRepository workingHoursRepo;

    public AdminController(UserRepository userRepo,
                           ServiceProviderRepository providerRepo,
                           ServiceRepository serviceRepo,
                           BookingRepository bookingRepo,
                           ReviewRepository reviewRepo,
                           FavouriteRepository favouriteRepo,
                           WorkingHoursRepository workingHoursRepo) {
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
        this.serviceRepo = serviceRepo;
        this.bookingRepo = bookingRepo;
        this.reviewRepo = reviewRepo;
        this.favouriteRepo = favouriteRepo;
        this.workingHoursRepo = workingHoursRepo;
    }

    // ── Users ──────────────────────────────────────────
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepo.findAll().stream()
                .map(u -> { u.setPassword(null); return u; })
                .toList();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        try {
            User target = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            // Nobody can delete a SUPER_ADMIN
            if (target.getRole() == User.Role.SUPER_ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete Super Admin"));
            // Only SUPER_ADMIN can delete an ADMIN
            if (target.getRole() == User.Role.ADMIN) {
                User caller = userRepo.findByEmail(auth.getName()).orElseThrow();
                if (caller.getRole() != User.Role.SUPER_ADMIN)
                    return ResponseEntity.badRequest().body(Map.of("message", "Only Super Admin can remove admins"));
            }
            bookingRepo.deleteByCustomerId(id);
            favouriteRepo.deleteByUserId(id);
            reviewRepo.deleteByUserId(id);
            // If PROVIDER — also delete all their service listings and related data
            if (target.getRole() == User.Role.PROVIDER) {
                providerRepo.findAll().stream()
                        .filter(p -> p.getName().equalsIgnoreCase(target.getName()))
                        .forEach(p -> {
                            bookingRepo.cancelActiveBookingsByProviderId(p.getId());
                            reviewRepo.deleteByProviderId(p.getId());
                            bookingRepo.deleteByProviderId(p.getId());
                            favouriteRepo.deleteByProviderId(p.getId());
                            workingHoursRepo.deleteByProviderId(p.getId());
                            providerRepo.deleteById(p.getId());
                        });
            }
            userRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long id, Authentication auth) {
        try {
            User caller = userRepo.findByEmail(auth.getName()).orElseThrow();
            if (caller.getRole() != User.Role.SUPER_ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "Only Super Admin can promote users"));
            User target = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            if (target.getRole() == User.Role.SUPER_ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "User is already Super Admin"));
            target.setRole(User.Role.ADMIN);
            userRepo.save(target);
            return ResponseEntity.ok(Map.of("message", target.getName() + " promoted to Admin"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/users/{id}/demote")
    public ResponseEntity<?> demoteAdmin(@PathVariable Long id, Authentication auth) {
        try {
            User caller = userRepo.findByEmail(auth.getName()).orElseThrow();
            if (caller.getRole() != User.Role.SUPER_ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "Only Super Admin can demote admins"));
            User target = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            if (target.getRole() != User.Role.ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "User is not an Admin"));
            target.setRole(User.Role.CUSTOMER);
            userRepo.save(target);
            return ResponseEntity.ok(Map.of("message", target.getName() + " demoted to Customer"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/users/{id}/transfer-super-admin")
    public ResponseEntity<?> transferSuperAdmin(@PathVariable Long id, Authentication auth) {
        try {
            User caller = userRepo.findByEmail(auth.getName()).orElseThrow();
            if (caller.getRole() != User.Role.SUPER_ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "Only Super Admin can transfer this role"));
            User target = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
            if (target.getRole() != User.Role.ADMIN)
                return ResponseEntity.badRequest().body(Map.of("message", "Target must be an Admin first"));
            // Transfer: caller becomes ADMIN, target becomes SUPER_ADMIN
            caller.setRole(User.Role.ADMIN);
            target.setRole(User.Role.SUPER_ADMIN);
            userRepo.save(caller);
            userRepo.save(target);
            return ResponseEntity.ok(Map.of("message", "Super Admin transferred to " + target.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Providers ──────────────────────────────────────
    @GetMapping("/providers")
    public List<ServiceProvider> getAllProviders() {
        return providerRepo.findAll();
    }

    @DeleteMapping("/providers/{id}")
    public ResponseEntity<?> deleteProvider(@PathVariable Long id) {
        try {
            bookingRepo.cancelActiveBookingsByProviderId(id);
            reviewRepo.deleteByProviderId(id);
            bookingRepo.deleteByProviderId(id);
            favouriteRepo.deleteByProviderId(id);
            workingHoursRepo.deleteByProviderId(id);
            providerRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Provider deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Services ───────────────────────────────────────
    @GetMapping("/services")
    public List<ServiceEntity> getAllServices() {
        return serviceRepo.findAll();
    }

    @PatchMapping("/services/{id}/rename")
    public ResponseEntity<?> renameService(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            ServiceEntity svc = serviceRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Service not found"));
            svc.setName(body.get("name"));
            serviceRepo.save(svc);
            return ResponseEntity.ok(svc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/services/merge")
    public ResponseEntity<?> mergeServices(@RequestBody Map<String, Object> body) {
        try {
            Long keepId = Long.valueOf(body.get("keepId").toString());
            Long deleteId = Long.valueOf(body.get("deleteId").toString());
            // reassign all providers from deleteId to keepId
            providerRepo.findAll().stream()
                    .filter(p -> p.getService().getId().equals(deleteId))
                    .forEach(p -> {
                        p.setService(serviceRepo.findById(keepId)
                                .orElseThrow(() -> new RuntimeException("Service not found")));
                        providerRepo.save(p);
                    });
            serviceRepo.deleteById(deleteId);
            return ResponseEntity.ok(Map.of("message", "Services merged"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            long inUse = providerRepo.findAll().stream()
                    .filter(p -> p.getService().getId().equals(id)).count();
            if (inUse > 0)
                return ResponseEntity.badRequest().body(Map.of("message",
                        inUse + " provider(s) are using this category. Use \"Merge\" to move them to another category first."));
            serviceRepo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Category deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Stats ──────────────────────────────────────────
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepo.count(),
                "totalProviders", providerRepo.countDistinctProviders(),
                "totalServices", serviceRepo.count(),
                "totalBookings", bookingRepo.count(),
                "totalReviews", reviewRepo.count()
        ));
    }

    // ── Bookings ───────────────────────────────────────
    @GetMapping("/bookings")
    public ResponseEntity<?> getAllBookings() {
        try {
            return ResponseEntity.ok(bookingRepo.findAll().stream().map(b -> Map.of(
                "id", b.getId(),
                "customerName", b.getCustomer().getName(),
                "providerName", b.getProvider().getName(),
                "serviceName", b.getProvider().getService().getName(),
                "bookingTime", b.getBookingTime().toString(),
                "status", b.getStatus().name(),
                "note", b.getNote() != null ? b.getNote() : "",
                "createdAt", b.getCreatedAt().toString()
            )).toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ── Reviews ────────────────────────────────────────
    @GetMapping("/reviews")
    public ResponseEntity<?> getAllReviews() {
        try {
            return ResponseEntity.ok(reviewRepo.findAll().stream().map(r -> Map.of(
                "id", r.getId(),
                "userName", r.getUser().getName(),
                "providerName", r.getProvider().getName(),
                "serviceName", r.getProvider().getService().getName(),
                "rating", r.getRating(),
                "comment", r.getComment() != null ? r.getComment() : "",
                "createdAt", r.getCreatedAt().toString()
            )).toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
