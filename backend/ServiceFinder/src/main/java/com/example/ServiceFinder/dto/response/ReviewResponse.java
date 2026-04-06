package com.example.ServiceFinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ReviewResponse {
    private Long id;
    private String userName;
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
    private boolean isOwner;

    @com.fasterxml.jackson.annotation.JsonProperty("isOwner")
    public boolean isOwner() { return isOwner; }
}
