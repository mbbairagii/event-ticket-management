package com.eventticketplatform.paymentservice.dto;

import com.eventticketplatform.paymentservice.entity.BookingStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
public class BookingDto {
    private Long id;
    private Long userId;
    private Long eventId;
    private String eventName;
    private Integer quantity;
    private BigDecimal totalAmount;
    private LocalDateTime bookingDate;
    private LocalDateTime expiresAt;
    private BookingStatus status;
}