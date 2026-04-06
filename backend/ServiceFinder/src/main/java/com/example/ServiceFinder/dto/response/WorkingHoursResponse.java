package com.example.ServiceFinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WorkingHoursResponse {
    private Long id;
    private String day;
    private String startTime;
    private String endTime;
    private boolean active;
}
