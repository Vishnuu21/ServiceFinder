package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.WorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Long> {
    List<WorkingHours> findByProviderId(Long providerId);
    @Transactional
    void deleteByProviderId(Long providerId);
    Optional<WorkingHours> findByProviderIdAndDay(Long providerId, WorkingHours.DayOfWeek day);
}
