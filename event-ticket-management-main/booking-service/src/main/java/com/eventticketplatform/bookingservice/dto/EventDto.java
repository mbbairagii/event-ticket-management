package com.eventticketplatform.bookingservice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class EventDto {
    private Long id;
    private String name;
    private String description;
    private String venue;
    private String city;
    private LocalDateTime eventDate;
    private Integer totalSeats;
    private Integer availableSeats;
    private BigDecimal price;
    private String category;
    private String imageUrl;
}
