package com.eventticketplatform.paymentservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateOrderRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long bookingId;

    private BigDecimal amount;
}