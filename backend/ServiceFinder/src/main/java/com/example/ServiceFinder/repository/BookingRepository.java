package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    boolean existsByCustomerIdAndProviderIdAndStatus(Long customerId, Long providerId, Booking.Status status);
    @Transactional
    void deleteByProviderId(Long providerId);
    @Transactional
    void deleteByCustomerId(Long customerId);
    @Modifying
    @Transactional
    @Query("UPDATE Booking b SET b.status = 'CANCELLED' WHERE b.provider.id = :providerId AND b.status IN ('PENDING', 'CONFIRMED')")
    void cancelActiveBookingsByProviderId(Long providerId);
}
