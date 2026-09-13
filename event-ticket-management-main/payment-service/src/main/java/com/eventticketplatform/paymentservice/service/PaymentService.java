package com.eventticketplatform.paymentservice.service;

import com.eventticketplatform.paymentservice.client.BookingServiceClient;
import com.eventticketplatform.paymentservice.dto.*;
import com.eventticketplatform.paymentservice.entity.BookingStatus;
import com.eventticketplatform.paymentservice.entity.Payment;
import com.eventticketplatform.paymentservice.entity.PaymentStatus;
import com.eventticketplatform.paymentservice.repository.PaymentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingServiceClient bookingServiceClient;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;


    public RazorpayOrderResponseDto createOrder(CreateOrderRequestDto dto) {
        BigDecimal amount;
        Long bookingId = dto.getBookingId();

        if (bookingId != null) {
            BookingDto booking = bookingServiceClient.getBookingById(bookingId);

            if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
                throw new IllegalArgumentException("Cannot pay for a " + booking.getStatus() + " booking.");
            }
            if (!booking.getUserId().equals(dto.getUserId())) {
                throw new IllegalArgumentException("User does not own this booking.");
            }
            paymentRepository.findByBookingId(bookingId).ifPresent(p -> {
                if (p.getStatus() == PaymentStatus.COMPLETED) {
                    throw new IllegalArgumentException("Booking is already paid.");
                }
            });
            amount = booking.getTotalAmount();
        } else {
            if (dto.getAmount() == null || dto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("amount is required when bookingId is not supplied.");
            }
            amount = dto.getAmount();
        }

        long amountInPaise = amount.multiply(BigDecimal.valueOf(100)).longValueExact();

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + UUID.randomUUID().toString().substring(0, 12));

            Order order = client.orders.create(orderRequest);

            Payment payment = new Payment();
            payment.setBookingId(bookingId);
            payment.setUserId(dto.getUserId());
            payment.setAmount(amount);
            payment.setPaymentMethod("RAZORPAY");
            payment.setStatus(PaymentStatus.PENDING);
            payment.setRazorpayOrderId(order.get("id"));

            Payment saved = paymentRepository.save(payment);

            return new RazorpayOrderResponseDto(
                    saved.getId(),
                    order.get("id"),
                    amountInPaise,
                    "INR",
                    razorpayKeyId
            );
        } catch (RazorpayException e) {
            throw new IllegalStateException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }


    public PaymentResponseDto verifyPayment(VerifyPaymentRequestDto dto) {
        Payment payment = paymentRepository.findByRazorpayOrderId(dto.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No payment found for Razorpay order: " + dto.getRazorpayOrderId()));
        JSONObject attributes = new JSONObject();

        attributes.put("razorpay_order_id", dto.getRazorpayOrderId());
        attributes.put("razorpay_payment_id", dto.getRazorpayPaymentId());
        attributes.put("razorpay_signature", dto.getRazorpaySignature());

        boolean isValid;
        try {
            isValid = Utils.verifyPaymentSignature(attributes, razorpayKeySecret);
        } catch (RazorpayException e) {
            isValid = false;
        }

        if (!isValid) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new IllegalArgumentException("Payment signature verification failed.");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setRazorpayPaymentId(dto.getRazorpayPaymentId());
        payment.setRazorpaySignature(dto.getRazorpaySignature());
        payment.setTransactionId(dto.getRazorpayPaymentId());
        payment.setPaymentDate(LocalDateTime.now());
        
        Long targetBookingId = payment.getBookingId() != null ? payment.getBookingId() : dto.getBookingId();
        if (targetBookingId != null) {
            payment.setBookingId(targetBookingId);
        }

        Payment saved = paymentRepository.save(payment);

        // Confirm the booking reservation in booking-service
        if (targetBookingId != null) {
            try {
                bookingServiceClient.confirmBooking(targetBookingId);
            } catch (Exception ex) {
                // If booking confirmation failed (e.g. timeout/expired), throw or log
                throw new IllegalStateException("Payment was successful but booking confirmation failed: " + ex.getMessage(), ex);
            }
        }

        return toResponseDto(saved);
    }

    public PaymentResponseDto getPaymentByBooking(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No payment found for booking: " + bookingId));
        return toResponseDto(payment);
    }

    /**
     * Tiered refund policy based on days until the event:
     *  > 7 days  → 100% refund
     *  3–7 days  → 50% refund
     *  < 3 days  → 0% refund (no refund allowed)
     */
    public PaymentResponseDto processRefund(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No payment found for booking: " + bookingId));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            throw new IllegalStateException("Payment has already been refunded.");
        }
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new IllegalStateException("Only completed payments can be refunded.");
        }
        if (payment.getRazorpayPaymentId() == null) {
            throw new IllegalStateException("No Razorpay payment ID found — cannot initiate refund.");
        }

        // Determine refund percentage based on days until event
        BookingDto booking = bookingServiceClient.getBookingById(bookingId);
        int refundPct = calculateRefundPercentage(booking.getEventDate());

        if (refundPct == 0) {
            throw new IllegalStateException(
                "Refund not available: the event is less than 3 days away. No refunds are issued within 72 hours of the event.");
        }

        BigDecimal refundAmount = payment.getAmount()
                .multiply(BigDecimal.valueOf(refundPct))
                .divide(BigDecimal.valueOf(100));
        long refundInPaise = refundAmount.multiply(BigDecimal.valueOf(100)).longValueExact();

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("amount", refundInPaise);
            refundRequest.put("speed", "optimum");

            com.razorpay.Refund refund = client.payments.refund(payment.getRazorpayPaymentId(), refundRequest);

            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRazorpayRefundId(refund.get("id"));
            payment.setRefundAmount(refundAmount);
            payment.setRefundDate(LocalDateTime.now());
            Payment saved = paymentRepository.save(payment);

            // Cancel the booking and restore seats
            try {
                bookingServiceClient.cancelBooking(bookingId);
            } catch (Exception ex) {
                System.err.println("Warning: refund issued but booking cancel failed: " + ex.getMessage());
            }

            PaymentResponseDto dto = toResponseDto(saved);
            dto.setRefundPercentage(refundPct);
            dto.setRefundAmount(refundAmount);
            return dto;

        } catch (RazorpayException e) {
            throw new IllegalStateException("Razorpay refund failed: " + e.getMessage(), e);
        }
    }

    private int calculateRefundPercentage(LocalDateTime eventDate) {
        if (eventDate == null) return 100; // no event date info → allow full refund
        long daysUntilEvent = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), eventDate);
        if (daysUntilEvent > 7)  return 100;
        if (daysUntilEvent >= 3) return 50;
        return 0;
    }

    private PaymentResponseDto toResponseDto(Payment p) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setId(p.getId());
        dto.setBookingId(p.getBookingId());
        dto.setUserId(p.getUserId());
        dto.setAmount(p.getAmount());
        dto.setStatus(p.getStatus());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setTransactionId(p.getTransactionId());
        dto.setRazorpayOrderId(p.getRazorpayOrderId());
        dto.setRazorpayPaymentId(p.getRazorpayPaymentId());
        dto.setRazorpayRefundId(p.getRazorpayRefundId());
        dto.setRefundDate(p.getRefundDate());
        dto.setRefundAmount(p.getRefundAmount());
        return dto;
    }
}