package com.example.ServiceFinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProviderResponse {

    private Long id;
    private String name;
    private String phone;
    private String serviceName;
    private double distance;
    private double latitude;
    private double longitude;
    private double averageRating;
    private int totalReviews;
    private boolean available;
    private int favouriteCount;
    private String description;
    private String profilePicture;
}