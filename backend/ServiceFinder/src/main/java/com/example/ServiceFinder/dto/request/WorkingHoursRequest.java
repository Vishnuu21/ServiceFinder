package com.example.ServiceFinder.dto.request;

import lombok.Data;

@Data
public class WorkingHoursRequest {
    private String day;
    private String startTime;
    private String endTime;
    private boolean active;
    private Long providerId;
}
