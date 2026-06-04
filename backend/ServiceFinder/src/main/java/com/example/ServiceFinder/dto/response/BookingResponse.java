package com.example.ServiceFinder.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerProfilePicture;
    private String providerName;
    private String serviceName;
    private String providerPhone;
    private String providerProfilePicture;
    private LocalDateTime bookingTime;
    private String note;
    private String status;
    private LocalDateTime createdAt;
}
