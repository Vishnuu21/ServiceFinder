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

    // Get bookings for customer
    public List<BookingResponse> getCustomerBookings(String email) {
        User customer = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepo.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream().map(this::toResponse).toList();
    }

    // Get bookings for provider
    public List<BookingResponse> getProviderBookings(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider = providerRepo.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(user.getName()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("No provider profile found"));

        return bookingRepo.findByProviderIdOrderByCreatedAtDesc(provider.getId())
                .stream().map(this::toResponse).toList();
    }

    // Update booking status
    public BookingResponse updateStatus(String email, Long bookingId, String status) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepo.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        Booking.Status newStatus = Booking.Status.valueOf(status.toUpperCase());

        // customer can only cancel
        if (user.getRole().equals(User.Role.CUSTOMER)) {
            if (!booking.getCustomer().getId().equals(user.getId()))
                throw new RuntimeException("Not your booking");
            if (newStatus != Booking.Status.CANCELLED)
                throw new RuntimeException("Customers can only cancel bookings");
        }

        // provider can confirm, cancel, complete
        if (user.getRole().equals(User.Role.PROVIDER)) {
            boolean isTheirBooking = booking.getProvider().getName()
                    .equalsIgnoreCase(user.getName());
            if (!isTheirBooking)
                throw new RuntimeException("Not your booking");
        }

        booking.setStatus(newStatus);
        return toResponse(bookingRepo.save(booking));
    }

    private BookingResponse toResponse(Booking b) {
        return new BookingResponse(
                b.getId(),
                b.getCustomer().getName(),
                b.getProvider().getName(),
                b.getProvider().getService().getName(),
                b.getProvider().getPhone(),
                b.getBookingTime(),
                b.getNote(),
                b.getStatus().name(),
                b.getCreatedAt()
        );
    }
}
