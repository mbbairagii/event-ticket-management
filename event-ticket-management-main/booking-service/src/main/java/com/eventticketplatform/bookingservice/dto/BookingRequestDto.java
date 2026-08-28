package com.eventticketplatform.bookingservice.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequestDto {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "At least 1 ticket must be booked")
    private Integer quantity;
}
