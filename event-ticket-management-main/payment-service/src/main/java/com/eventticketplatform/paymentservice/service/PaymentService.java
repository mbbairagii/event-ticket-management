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

    /**
     * Creates a Razorpay order and a local PENDING payment row.
     * If bookingId is supplied, the booking is validated (ownership, not
     * cancelled, not already paid) and its totalAmount is used, ignoring
     * any client-supplied amount. Otherwise dto.amount is used directly,
     * to support this app's flow of paying before the booking is created.
     */
    public RazorpayOrderResponseDto createOrder(CreateOrderRequestDto dto) {
        BigDecimal amount;
        Long bookingId = dto.getBookingId();

        if (bookingId != null) {
            BookingDto booking = bookingServiceClient.getBookingById(bookingId);

            if (booking.getStatus() == BookingStatus.CANCELLED) {
                throw new IllegalArgumentException("Cannot pay for a cancelled booking.");
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

    /**
     * Verifies the signature Razorpay Checkout returns on success and marks
     * the matching payment COMPLETED. This is the step that was previously
     * missing entirely - without it, a payment is never actually confirmed
     * as genuine, since anyone could call the API and claim success.
     */
    public PaymentResponseDto verifyPayment(VerifyPaymentRequestDto dto) {
        Payment payment = paymentRepository.findByRazorpayOrderId(dto.getRazorpayOrderId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "No payment found for Razorpay order: " + dto.getRazorpayOrderId()));

        Map<String, String> attributes = new HashMap<>();
        attributes.put("razorpay_order_id", dto.getRazorpayOrderId());
        attributes.put("razorpay_payment_id", dto.getRazorpayPaymentId());
        attributes.put("razorpay_signature", dto.getRazorpaySignature());

        boolean isValid;
        try {
            isValid = Utils.verifyPaymentSignature((JSONObject) attributes, razorpayKeySecret);
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
        if (dto.getBookingId() != null && payment.getBookingId() == null) {
            payment.setBookingId(dto.getBookingId());
        }

        Payment saved = paymentRepository.save(payment);
        return toResponseDto(saved);
    }

    public PaymentResponseDto getPaymentByBooking(Long bookingId) {
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("No payment found for booking: " + bookingId));
        return toResponseDto(payment);
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
        return dto;
    }
}