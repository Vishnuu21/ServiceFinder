package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByProviderIdOrderByCreatedAtDesc(Long providerId);
    @Transactional
    void deleteByProviderId(Long providerId);
}
