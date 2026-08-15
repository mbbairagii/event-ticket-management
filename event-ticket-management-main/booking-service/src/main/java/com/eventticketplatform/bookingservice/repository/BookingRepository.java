package com.eventticketplatform.bookingservice.repository;

import com.eventticketplatform.bookingservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);

    List<Booking> findByEventIdIn(List<Long> eventIds);
}