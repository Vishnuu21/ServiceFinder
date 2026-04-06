package com.example.ServiceFinder.service;

import com.example.ServiceFinder.dto.request.ReviewRequest;
import com.example.ServiceFinder.dto.response.ReviewResponse;
import com.example.ServiceFinder.entity.Review;
import com.example.ServiceFinder.entity.ServiceProvider;
import com.example.ServiceFinder.entity.User;
import com.example.ServiceFinder.repository.ReviewRepository;
import com.example.ServiceFinder.repository.ServiceProviderRepository;
import com.example.ServiceFinder.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepo;
    private final UserRepository userRepo;
    private final ServiceProviderRepository providerRepo;

    public ReviewService(ReviewRepository reviewRepo,
                         UserRepository userRepo,
                         ServiceProviderRepository providerRepo) {
        this.reviewRepo = reviewRepo;
        this.userRepo = userRepo;
        this.providerRepo = providerRepo;
    }

    public ReviewResponse addReview(String email, ReviewRequest request) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (reviewRepo.existsByUserIdAndProviderId(user.getId(), request.getProviderId())) {
            throw new RuntimeException("You have already reviewed this provider");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        ServiceProvider provider = providerRepo.findById(request.getProviderId())
                .orElseThrow(() -> new RuntimeException("Provider not found"));

        Review review = Review.builder()
                .user(user)
                .provider(provider)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepo.save(review);
        return toResponse(saved, true);
    }

    public ReviewResponse editReview(String email, Long reviewId, ReviewRequest request) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only edit your own review");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        Review saved = reviewRepo.save(review);
        return toResponse(saved, true);
    }

    public void deleteReview(String email, Long reviewId) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own review");
        }

        reviewRepo.delete(review);
    }

    public List<ReviewResponse> getReviews(Long providerId, String email) {
        User user = email != null ? userRepo.findByEmail(email).orElse(null) : null;
        return reviewRepo.findByProviderId(providerId).stream()
                .map(r -> toResponse(r, user != null && r.getUser().getId().equals(user.getId())))
                .toList();
    }

    private ReviewResponse toResponse(Review r, boolean isOwner) {
        return new ReviewResponse(
                r.getId(),
                r.getUser().getName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt(),
                isOwner
        );
    }
}
