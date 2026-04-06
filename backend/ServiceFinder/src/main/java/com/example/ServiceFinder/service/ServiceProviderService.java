package com.example.ServiceFinder.service;

import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.entity.ServiceEntity;
import com.example.ServiceFinder.entity.WorkingHours;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.repository.ServiceProviderRepository;
import com.example.ServiceFinder.repository.ServiceRepository;
import com.example.ServiceFinder.repository.ReviewRepository;
import com.example.ServiceFinder.repository.WorkingHoursRepository;
import com.example.ServiceFinder.repository.BookingRepository;
import com.example.ServiceFinder.repository.FavouriteRepository;
import com.example.ServiceFinder.repository.UserRepository;
import com.example.ServiceFinder.dto.response.ProviderResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class ServiceProviderService {

    private final ServiceProviderRepository repo;
    private final ServiceRepository serviceRepo;
    private final ReviewRepository reviewRepo;
    private final WorkingHoursRepository workingHoursRepo;
    private final FavouriteRepository favouriteRepo;
    private final BookingRepository bookingRepo;
    private final UserRepository userRepo;

    public ServiceProviderService(ServiceProviderRepository repo,
                                   ServiceRepository serviceRepo,
                                   ReviewRepository reviewRepo,
                                   WorkingHoursRepository workingHoursRepo,
                                   FavouriteRepository favouriteRepo,
                                   BookingRepository bookingRepo,
                                   UserRepository userRepo) {
        this.repo = repo;
        this.serviceRepo = serviceRepo;
        this.reviewRepo = reviewRepo;
        this.workingHoursRepo = workingHoursRepo;
        this.favouriteRepo = favouriteRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
    }

    public ServiceProvider save(ServiceProvider provider) {
        Long serviceId = provider.getService().getId();
        ServiceEntity service = serviceRepo.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        provider.setService(service);
        return repo.save(provider);
    }

    @Transactional
    public ServiceProvider updateService(String email, Long providerId, java.util.Map<String, Object> body) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceProvider provider = repo.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!provider.getName().equalsIgnoreCase(user.getName()))
            throw new RuntimeException("Not your service");
        if (body.containsKey("phone"))       provider.setPhone((String) body.get("phone"));
        if (body.containsKey("description")) provider.setDescription((String) body.get("description"));
        if (body.containsKey("latitude"))    provider.setLatitude(((Number) body.get("latitude")).doubleValue());
        if (body.containsKey("longitude"))   provider.setLongitude(((Number) body.get("longitude")).doubleValue());
        return repo.save(provider);
    }

    @Transactional
    public void deleteService(String email, Long providerId) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        ServiceProvider provider = repo.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        if (!provider.getName().equalsIgnoreCase(user.getName()))
            throw new RuntimeException("Not your service");
        reviewRepo.deleteByProviderId(providerId);
        bookingRepo.deleteByProviderId(providerId);
        favouriteRepo.deleteByProviderId(providerId);
        workingHoursRepo.deleteByProviderId(providerId);
        repo.deleteById(providerId);
    }

    private String getProfilePicture(String providerName) {
        return userRepo.findAll().stream()
                .filter(u -> u.getName().equalsIgnoreCase(providerName))
                .findFirst()
                .map(User::getProfilePicture)
                .orElse(null);
    }

    private ProviderResponse toResponse(ServiceProvider p, double lat, double lon) {
        Double avg = reviewRepo.findAverageRatingByProviderId(p.getId());
        int total = reviewRepo.findByProviderId(p.getId()).size();
        double rating = avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
        boolean available = isAvailableNow(p.getId());
        int favCount = favouriteRepo.countByProviderId(p.getId());
        return new ProviderResponse(
                p.getId(),
                p.getName(),
                p.getPhone(),
                p.getService().getName(),
                distance(lat, lon, p.getLatitude(), p.getLongitude()),
                p.getLatitude(),
                p.getLongitude(),
                rating,
                total,
                available,
                favCount,
                p.getDescription(),
                getProfilePicture(p.getName())
        );
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

    public ProviderResponse findById(Long id) {
        ServiceProvider p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        return toResponse(p, p.getLatitude(), p.getLongitude());
    }

    public List<ProviderResponse> findNearbyAll(double lat, double lon) {
        return repo.findAll().stream()
                .map(p -> toResponse(p, lat, lon))
                .sorted(Comparator.comparing(ProviderResponse::getDistance))
                .limit(10)
                .toList();
    }

    public List<ProviderResponse> findNearbyByService(double lat, double lon, Long serviceId) {
        return repo.findByServiceId(serviceId).stream()
                .map(p -> toResponse(p, lat, lon))
                .sorted(Comparator.comparing(ProviderResponse::getDistance))
                .limit(10)
                .toList();
    }

    public List<ProviderResponse> findNearbyByServiceName(double lat, double lon, String serviceName) {
        return repo.findByServiceNameIgnoreCase(serviceName).stream()
                .map(p -> toResponse(p, lat, lon))
                .sorted(Comparator.comparing(ProviderResponse::getDistance))
                .limit(10)
                .toList();
    }

    private double distance(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) *
                        Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
