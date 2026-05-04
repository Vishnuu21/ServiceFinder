package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProviderId(Long providerId);
    @Transactional
    void deleteByProviderId(Long providerId);
    @Transactional
    void deleteByUserId(Long userId);

    Optional<Review> findByUserIdAndProviderId(Long userId, Long providerId);

    boolean existsByUserIdAndProviderId(Long userId, Long providerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.provider.id = :providerId")
    Double findAverageRatingByProviderId(Long providerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.provider.id = :providerId")
    int countByProviderId(Long providerId);
}
