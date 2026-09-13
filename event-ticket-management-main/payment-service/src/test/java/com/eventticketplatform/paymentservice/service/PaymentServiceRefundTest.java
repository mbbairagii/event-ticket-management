package com.eventticketplatform.paymentservice.service;

import com.eventticketplatform.paymentservice.client.BookingServiceClient;
import com.eventticketplatform.paymentservice.dto.BookingDto;
import com.eventticketplatform.paymentservice.entity.Payment;
import com.eventticketplatform.paymentservice.entity.PaymentStatus;
import com.eventticketplatform.paymentservice.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for refund guard-clauses and tiered refund percentage logic.
 * Razorpay SDK calls are NOT exercised here — those require integration/sandbox tests.
 */
@ExtendWith(MockitoExtension.class)
class PaymentServiceRefundTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private BookingServiceClient bookingServiceClient;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void injectKeys() {
        // inject @Value fields that Spring normally wires
        ReflectionTestUtils.setField(paymentService, "razorpayKeyId",     "rzp_test_dummy");
        ReflectionTestUtils.setField(paymentService, "razorpayKeySecret", "dummy_secret");
    }

    // ── Guard clauses ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("processRefund: throws when no payment exists for bookingId")
    void refund_noPaymentFound_throws() {
        when(paymentRepository.findByBookingId(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> paymentService.processRefund(99L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("processRefund: throws IllegalStateException when already REFUNDED")
    void refund_alreadyRefunded_throws() {
        Payment p = buildPayment(PaymentStatus.REFUNDED, "pay_abc", new BigDecimal("1000"));
        when(paymentRepository.findByBookingId(1L)).thenReturn(Optional.of(p));

        assertThatThrownBy(() -> paymentService.processRefund(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("already been refunded");
    }

    @Test
    @DisplayName("processRefund: throws IllegalStateException when status is PENDING (not COMPLETED)")
    void refund_notCompleted_throws() {
        Payment p = buildPayment(PaymentStatus.PENDING, "pay_abc", new BigDecimal("1000"));
        when(paymentRepository.findByBookingId(2L)).thenReturn(Optional.of(p));

        assertThatThrownBy(() -> paymentService.processRefund(2L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Only completed payments");
    }

    @Test
    @DisplayName("processRefund: throws IllegalStateException when razorpayPaymentId is null")
    void refund_noRazorpayId_throws() {
        Payment p = buildPayment(PaymentStatus.COMPLETED, null, new BigDecimal("500"));
        when(paymentRepository.findByBookingId(3L)).thenReturn(Optional.of(p));

        assertThatThrownBy(() -> paymentService.processRefund(3L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No Razorpay payment ID");
    }

    @Test
    @DisplayName("processRefund: throws when event is < 3 days away (0% refund policy)")
    void refund_within72Hours_throws() {
        Payment p = buildPayment(PaymentStatus.COMPLETED, "pay_xyz", new BigDecimal("2000"));
        when(paymentRepository.findByBookingId(4L)).thenReturn(Optional.of(p));

        BookingDto booking = new BookingDto();
        booking.setEventDate(LocalDateTime.now().plusDays(1)); // 1 day away → 0%
        when(bookingServiceClient.getBookingById(4L)).thenReturn(booking);

        assertThatThrownBy(() -> paymentService.processRefund(4L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("less than 3 days away");
    }

    // ── Refund percentage calculation (via package-private helper exposed via reflection) ──

    @Test
    @DisplayName("calculateRefundPercentage: null eventDate → 100%")
    void refundPct_nullDate_returns100() {
        int pct = invokeCalculate(null);
        assertThat(pct).isEqualTo(100);
    }

    @Test
    @DisplayName("calculateRefundPercentage: event > 7 days away → 100%")
    void refundPct_moreThan7Days_returns100() {
        int pct = invokeCalculate(LocalDateTime.now().plusDays(10));
        assertThat(pct).isEqualTo(100);
    }

    @Test
    @DisplayName("calculateRefundPercentage: event exactly 7 days away → 50%")
    void refundPct_exactly7Days_returns50() {
        int pct = invokeCalculate(LocalDateTime.now().plusDays(7));
        assertThat(pct).isEqualTo(50);
    }

    @Test
    @DisplayName("calculateRefundPercentage: event 3–6 days away → 50%")
    void refundPct_between3And7Days_returns50() {
        int pct = invokeCalculate(LocalDateTime.now().plusDays(5));
        assertThat(pct).isEqualTo(50);
    }

    @Test
    @DisplayName("calculateRefundPercentage: event < 3 days away → 0%")
    void refundPct_lessThan3Days_returns0() {
        int pct = invokeCalculate(LocalDateTime.now().plusDays(2));
        assertThat(pct).isEqualTo(0);
    }

    @Test
    @DisplayName("calculateRefundPercentage: event in the past → 0%")
    void refundPct_pastEvent_returns0() {
        int pct = invokeCalculate(LocalDateTime.now().minusDays(1));
        assertThat(pct).isEqualTo(0);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Payment buildPayment(PaymentStatus status, String razorpayPaymentId, BigDecimal amount) {
        Payment p = new Payment();
        p.setId(1L);
        p.setBookingId(1L);
        p.setStatus(status);
        p.setRazorpayPaymentId(razorpayPaymentId);
        p.setAmount(amount);
        return p;
    }

    /** Invoke the private calculateRefundPercentage via reflection. */
    private int invokeCalculate(LocalDateTime eventDate) {
        return (int) ReflectionTestUtils.invokeMethod(
                paymentService, "calculateRefundPercentage", eventDate);
    }
}
