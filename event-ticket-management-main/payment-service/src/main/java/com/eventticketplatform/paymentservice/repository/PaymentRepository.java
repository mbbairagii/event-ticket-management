package com.eventticketplatform.paymentservice.repository;

import com.eventticketplatform.paymentservice.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBookingId(Long bookingId);
    List<Payment> findByUserId(Long userId);
    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);
}