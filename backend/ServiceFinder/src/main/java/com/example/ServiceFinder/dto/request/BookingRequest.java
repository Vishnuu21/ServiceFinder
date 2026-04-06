package com.example.ServiceFinder.dto.request;

import lombok.Data;

@Data
public class BookingRequest {
    private Long providerId;
    private String bookingTime; 
    private String note;
}
