package com.example.ServiceFinder.service;

import com.example.ServiceFinder.dto.request.BookingRequest;
import com.example.ServiceFinder.dto.response.BookingResponse;
import com.example.ServiceFinder.entity.Booking;
import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.repository.BookingRepository;
import com.example.ServiceFinder.repository.ServiceProviderRepository;
import com.example.ServiceFinder.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;
    private final ServiceProviderRepository providerRepo;

    public BookingService(BookingRepository bookingRepo,
                          UserRepository userRepo,
                          ServiceProviderRepository providerRepo) {
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
    }

    // Customer creates a booking
    public BookingResponse createBooking(String email, BookingRequest request) {
        User customer = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!customer.getRole().equals(User.Role.CUSTOMER)) {
            throw new RuntimeException("Only customers can make bookings");
        }

        ServiceProvider provider = providerRepo.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        Booking booking = Booking.builder()
                .customer(customer)
                .provider(provider)
                .bookingTime(LocalDateTime.parse(request.getBookingTime()))
                .note(request.getNote())
                .status(Booking.Status.PENDING)
                .build();

        return toResponse(bookingRepo.save(booking));
    }

    // Get all bookings (admin)
    public List<BookingResponse> getAllBookings() {
        return bookingRepo.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    // Get bookings for customer
    public List<BookingResponse> getCustomerBookings(String email) {
        User customer = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepo.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(this::toResponse).toList();
    }

    // Get bookings for provider
    public List<BookingResponse> getProviderBookings(String email) {
        List<ServiceProvider> providers = providerRepo.findAll().stream()
                .filter(p -> email.equalsIgnoreCase(p.getEmail()))
                .toList();
        if (providers.isEmpty()) throw new RuntimeException("No provider profile found");
        return providers.stream()
                .flatMap(p -> bookingRepo.findByProviderIdOrderByCreatedAtDesc(p.getId()).stream())
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toResponse)
                .toList();
    }

    // Update booking status
    public BookingResponse updateStatus(String email, Long bookingId, String status) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Booking.Status newStatus = Booking.Status.valueOf(status.toUpperCase());

        // admins have full control over any booking
        if (user.getRole().equals(User.Role.ADMIN) || user.getRole().equals(User.Role.SUPER_ADMIN)) {
            booking.setStatus(newStatus);
            return toResponse(bookingRepo.save(booking));
        }

        // customer can only cancel their own booking
        if (user.getRole().equals(User.Role.CUSTOMER)) {
            if (!booking.getCustomer().getId().equals(user.getId()))
                throw new RuntimeException("Not your booking");
            if (newStatus != Booking.Status.CANCELLED)
                throw new RuntimeException("You can only cancel bookings");
        }

        // provider can confirm, cancel, complete their own bookings
        if (user.getRole().equals(User.Role.PROVIDER)) {
            if (!user.getEmail().equalsIgnoreCase(booking.getProvider().getEmail()))
                throw new RuntimeException("Not your booking");
        }

        booking.setStatus(newStatus);
        return toResponse(bookingRepo.save(booking));
    }

    private BookingResponse toResponse(Booking b) {
        String providerPic = b.getProvider().getEmail() != null && !b.getProvider().getEmail().isEmpty()
                ? userRepo.findProfilePictureByEmail(b.getProvider().getEmail()).orElse(null)
                : userRepo.findProfilePictureByName(b.getProvider().getName()).orElse(null);
        return new BookingResponse(
                b.getId(),
                b.getCustomer().getId(),
                b.getCustomer().getName(),
                b.getProvider().getName(),
                b.getProvider().getService().getName(),
                b.getProvider().getPhone(),
                providerPic,
                b.getBookingTime(),
                b.getNote(),
                b.getStatus().name(),
                b.getCreatedAt()
        );
    }
}
