package com.eventticketplatform.bookingservice.scheduler;

import com.eventticketplatform.bookingservice.client.EventServiceClient;
import com.eventticketplatform.bookingservice.entity.Booking;
import com.eventticketplatform.bookingservice.entity.BookingStatus;
import com.eventticketplatform.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpiredBookingScheduler {

    private final BookingRepository bookingRepository;
    private final EventServiceClient eventServiceClient;

    @Scheduled(fixedRate = 15000)
    @Transactional
    public void cleanupExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Booking> expiredBookings = bookingRepository.findByStatusAndExpiresAtBefore(
                BookingStatus.PENDING_PAYMENT,
                now
        );

        if (expiredBookings.isEmpty()) {
            return;
        }

        for (Booking booking : expiredBookings) {
            try {
                booking.setStatus(BookingStatus.EXPIRED);
                bookingRepository.save(booking);

                // Restore seats back into event inventory
                eventServiceClient.updateSeats(booking.getEventId(), booking.getQuantity());

            } catch (Exception ex) {
                log.error("Failed to release seats for expired booking ID: {}", booking.getId(), ex);
            }
        }
    }
}
