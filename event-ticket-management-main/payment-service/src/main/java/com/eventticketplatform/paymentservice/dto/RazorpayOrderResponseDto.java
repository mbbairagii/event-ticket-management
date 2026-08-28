package com.eventticketplatform.paymentservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RazorpayOrderResponseDto {
    private Long paymentId;
    private String orderId;
    private Long amount;
    private String currency;
    private String keyId;
}