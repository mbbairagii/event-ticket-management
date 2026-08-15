package com.eventticketplatform.paymentservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * The three fields Razorpay Checkout hands back to the frontend's
 * `handler` callback on success: razorpay_order_id, razorpay_payment_id,
 * razorpay_signature. Verified server-side against the key secret.
 */
@Data
public class VerifyPaymentRequestDto {

    @NotBlank(message = "razorpayOrderId is required")
    private String razorpayOrderId;

    @NotBlank(message = "razorpayPaymentId is required")
    private String razorpayPaymentId;

    @NotBlank(message = "razorpaySignature is required")
    private String razorpaySignature;

    // Optional: pass this once the booking has actually been created,
    // to link it to the payment row that was opened before booking existed.
    private Long bookingId;
}