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
@SuppressWarnings("null")
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
        if (user.getRole() == User.Role.ADMIN || user.getRole() == User.Role.SUPER_ADMIN)
            throw new RuntimeException("Admins cannot add favourites");
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

    public List<ProviderResponse> getMyFavourites(String email, double lat, double lon) {
        User user = getUser(email);
        return favouriteRepo.findByUserId(user.getId()).stream()
                .map(f -> toResponse(f.getProvider(), lat, lon))
                .toList();
    }

    public boolean isFavourited(String email, Long providerId) {
        User user = getUser(email);
        return favouriteRepo.existsByUserIdAndProviderId(user.getId(), providerId);
    }

    public int getMyFavouriteCount(String email) {
        return providerRepo.findAll().stream()
                .filter(p -> email.equalsIgnoreCase(p.getEmail()))
                .mapToInt(p -> favouriteRepo.countByProviderId(p.getId()))
                .sum();
    }

    public List<ProviderResponse> getMyServices(String email) {
        return providerRepo.findAll().stream()
                .filter(p -> email.equalsIgnoreCase(p.getEmail()))
                .map(p -> toResponse(p, 0.0, 0.0))
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

    private ProviderResponse toResponse(ServiceProvider p, double lat, double lon) {
        Double avg = reviewRepo.findAverageRatingByProviderId(p.getId());
        int total = reviewRepo.countByProviderId(p.getId());
        double rating = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
        int favCount = favouriteRepo.countByProviderId(p.getId());
        String profilePicture = p.getEmail() != null && !p.getEmail().isEmpty()
                ? userRepo.findProfilePictureByEmail(p.getEmail()).orElse(null)
                : userRepo.findProfilePictureByName(p.getName()).orElse(null);
        double dist = distance(lat, lon, p.getLatitude(), p.getLongitude());
        return new ProviderResponse(
                p.getId(),
                p.getName(),
                p.getPhone(),
                p.getService().getName(),
                dist,
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

    private double distance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
