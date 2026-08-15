package com.eventticketplatform.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Sent back to the frontend so it can open Razorpay Checkout.
 * Field names intentionally match what PaymentModal.jsx / payment-modal.component.ts read.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponseDto {
    private Long paymentId;    // internal Payment row id, needed to verify later
    private String orderId;    // Razorpay order id (order_xxxxx)
    private Long amount;       // amount in paise, as Razorpay expects
    private String currency;   // "INR"
    private String keyId;      // Razorpay public key id, safe to expose to frontend
}