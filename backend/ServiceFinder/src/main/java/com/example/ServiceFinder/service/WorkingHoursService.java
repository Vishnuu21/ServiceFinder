package com.example.ServiceFinder.service;

import com.example.ServiceFinder.dto.request.WorkingHoursRequest;
import com.example.ServiceFinder.dto.response.WorkingHoursResponse;
import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.entity.WorkingHours;
import com.example.ServiceFinder.repository.ServiceProviderRepository;
import com.example.ServiceFinder.repository.UserRepository;
import com.example.ServiceFinder.repository.WorkingHoursRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.LocalDate;
import java.util.List;

@Service
public class WorkingHoursService {

    private final WorkingHoursRepository repo;
    private final ServiceProviderRepository providerRepo;
    private final UserRepository userRepo;

    public WorkingHoursService(WorkingHoursRepository repo,
                                ServiceProviderRepository providerRepo,
                                UserRepository userRepo) {
        this.repo = repo;
        this.providerRepo = providerRepo;
        this.userRepo = userRepo;
    }

    public List<WorkingHoursResponse> getWorkingHours(Long providerId) {
        return repo.findByProviderId(providerId).stream()
                .map(this::toResponse)
                .toList();
    }

    public WorkingHoursResponse saveWorkingHours(String email, WorkingHoursRequest request) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ServiceProvider provider;
        if (request.getProviderId() != null) {
            provider = providerRepo.findById(request.getProviderId())
                    .orElseThrow(() -> new RuntimeException("Provider not found"));
            if (!provider.getName().equalsIgnoreCase(user.getName()))
                throw new RuntimeException("Not your service");
        } else {
            provider = providerRepo.findAll().stream()
                    .filter(p -> p.getName().equalsIgnoreCase(user.getName()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No provider profile found."));
        }

        WorkingHours.DayOfWeek day = WorkingHours.DayOfWeek.valueOf(request.getDay().toUpperCase());

        // update existing or create new
        WorkingHours wh = repo.findByProviderIdAndDay(provider.getId(), day)
                .orElse(WorkingHours.builder().provider(provider).day(day).build());

        wh.setStartTime(LocalTime.parse(request.getStartTime()));
        wh.setEndTime(LocalTime.parse(request.getEndTime()));
        wh.setActive(request.isActive());

        return toResponse(repo.save(wh));
    }

    public boolean isAvailable(Long providerId) {
        // get current day and time
        java.time.DayOfWeek javaDow = LocalDate.now().getDayOfWeek();
        WorkingHours.DayOfWeek today = WorkingHours.DayOfWeek.valueOf(javaDow.name());
        LocalTime now = LocalTime.now();

        return repo.findByProviderIdAndDay(providerId, today)
                .map(wh -> wh.isActive()
                        && !now.isBefore(wh.getStartTime())
                        && !now.isAfter(wh.getEndTime()))
                .orElse(false);
    }

    private WorkingHoursResponse toResponse(WorkingHours wh) {
        return new WorkingHoursResponse(
                wh.getId(),
                wh.getDay().name(),
                wh.getStartTime() != null ? wh.getStartTime().toString() : null,
                wh.getEndTime() != null ? wh.getEndTime().toString() : null,
                wh.isActive()
        );
    }
}
