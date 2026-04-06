package com.example.ServiceFinder.service;

import com.example.ServiceFinder.dto.response.ProviderResponse;
import com.example.ServiceFinder.entity.Favourite;
import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.entity.WorkingHours;
import com.example.ServiceFinder.repository.FavouriteRepository;
import com.example.ServiceFinder.repository.ReviewRepository;
import com.example.ServiceFinder.repository.ServiceProviderRepository;
import com.example.ServiceFinder.repository.UserRepository;
import com.example.ServiceFinder.repository.WorkingHoursRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FavouriteService {

    private final FavouriteRepository favouriteRepo;
    private final UserRepository userRepo;
    private final ServiceProviderRepository providerRepo;
    private final ReviewRepository reviewRepo;
    private final WorkingHoursRepository workingHoursRepo;

    public FavouriteService(FavouriteRepository favouriteRepo,
                            UserRepository userRepo,
                            ServiceProviderRepository providerRepo,
                            ReviewRepository reviewRepo,
                            WorkingHoursRepository workingHoursRepo) {
        this.favouriteRepo = favouriteRepo;
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
        this.reviewRepo = reviewRepo;
        this.workingHoursRepo = workingHoursRepo;
    }

    public void addFavourite(String email, Long providerId) {
        User user = getUser(email);
        if (favouriteRepo.existsByUserIdAndProviderId(user.getId(), providerId)) return;
        ServiceProvider provider = providerRepo.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        favouriteRepo.save(Favourite.builder().user(user).provider(provider).build());
    }

    @Transactional
    public void removeFavourite(String email, Long providerId) {
        User user = getUser(email);
        favouriteRepo.deleteByUserIdAndProviderId(user.getId(), providerId);
    }

    public List<ProviderResponse> getMyFavourites(String email) {
        User user = getUser(email);
        return favouriteRepo.findByUserId(user.getId()).stream()
                .map(f -> toResponse(f.getProvider()))
                .toList();
    }

    public boolean isFavourited(String email, Long providerId) {
        User user = getUser(email);
        return favouriteRepo.existsByUserIdAndProviderId(user.getId(), providerId);
    }

    public int getMyFavouriteCount(String email) {
        User user = getUser(email);
        return providerRepo.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(user.getName()))
                .mapToInt(p -> favouriteRepo.countByProviderId(p.getId()))
                .sum();
    }

    public List<ProviderResponse> getMyServices(String email) {
        User user = getUser(email);
        return providerRepo.findAll().stream()
                .filter(p -> p.getName().equalsIgnoreCase(user.getName()))
                .map(this::toResponse)
                .toList();
    }

    private User getUser(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isAvailableNow(Long providerId) {
        java.time.DayOfWeek javaDow = java.time.LocalDate.now().getDayOfWeek();
        WorkingHours.DayOfWeek today = WorkingHours.DayOfWeek.valueOf(javaDow.name());
        java.time.LocalTime now = java.time.LocalTime.now();
        return workingHoursRepo.findByProviderIdAndDay(providerId, today)
                .map(wh -> wh.isActive()
                        && !now.isBefore(wh.getStartTime())
                        && !now.isAfter(wh.getEndTime()))
                .orElse(false);
    }

    private ProviderResponse toResponse(ServiceProvider p) {
        Double avg = reviewRepo.findAverageRatingByProviderId(p.getId());
        int total = reviewRepo.findByProviderId(p.getId()).size();
        double rating = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
        int favCount = favouriteRepo.countByProviderId(p.getId());
        String profilePicture = userRepo.findAll().stream()
                .filter(u -> u.getName().equalsIgnoreCase(p.getName()))
                .findFirst()
                .map(User::getProfilePicture)
                .orElse(null);
        return new ProviderResponse(
                p.getId(),
                p.getName(),
                p.getPhone(),
                p.getService().getName(),
                0.0,
                p.getLatitude(),
                p.getLongitude(),
                rating,
                total,
                isAvailableNow(p.getId()),
                favCount,
                p.getDescription(),
                profilePicture
        );
    }
}
