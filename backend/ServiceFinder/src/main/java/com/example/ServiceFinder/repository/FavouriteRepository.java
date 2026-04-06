package com.example.ServiceFinder.repository;

import com.example.ServiceFinder.entity.Favourite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface FavouriteRepository extends JpaRepository<Favourite, Long> {
    List<Favourite> findByUserId(Long userId);
    Optional<Favourite> findByUserIdAndProviderId(Long userId, Long providerId);
    boolean existsByUserIdAndProviderId(Long userId, Long providerId);
    @Transactional
    void deleteByUserIdAndProviderId(Long userId, Long providerId);
    @Transactional
    void deleteByProviderId(Long providerId);
    int countByProviderId(Long providerId);
}
