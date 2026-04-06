package com.example.ServiceFinder.dto.request;

import lombok.Data;

@Data
public class ReviewRequest {
    private Long providerId;
    private int rating;
    private String comment;
}
