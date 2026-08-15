package com.eventticketplatform.paymentservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateOrderRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    // Optional: present when paying for a booking that already exists.
    // When absent, "amount" must be supplied directly (e.g. paying before
    // a booking record has been created).
    private Long bookingId;

    // Required only when bookingId is not supplied. Rupees, not paise.
    private BigDecimal amount;
}