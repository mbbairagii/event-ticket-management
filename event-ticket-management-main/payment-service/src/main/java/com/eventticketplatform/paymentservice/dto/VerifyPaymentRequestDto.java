package com.eventticketplatform.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class VerifyPaymentRequestDto {

    @NotBlank(message = "razorpayOrderId is required")
    private String razorpayOrderId;

    @NotBlank(message = "razorpayPaymentId is required")
    private String razorpayPaymentId;

    @NotBlank(message = "razorpaySignature is required")
    private String razorpaySignature;

    private Long bookingId;
}