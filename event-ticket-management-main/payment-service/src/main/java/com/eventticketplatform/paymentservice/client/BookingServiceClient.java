package com.eventticketplatform.paymentservice.client;

import com.eventticketplatform.paymentservice.dto.BookingDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "booking-service")
public interface BookingServiceClient {

    @GetMapping("/api/bookings/{id}")
    BookingDto getBookingById(@PathVariable("id") Long id);

    @PutMapping("/api/bookings/{id}/confirm")
    BookingDto confirmBooking(@PathVariable("id") Long id);

    @PutMapping("/api/bookings/{id}/cancel")
    BookingDto cancelBooking(@PathVariable("id") Long id);
}
