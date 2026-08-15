package com.eventticketplatform.bookingservice.service;

import com.eventticketplatform.bookingservice.client.EventServiceClient;
import com.eventticketplatform.bookingservice.client.UserServiceClient;
import com.eventticketplatform.bookingservice.dto.BookingRequestDto;
import com.eventticketplatform.bookingservice.dto.BookingResponseDto;
import com.eventticketplatform.bookingservice.dto.EventDto;
import com.eventticketplatform.bookingservice.entity.Booking;
import com.eventticketplatform.bookingservice.entity.BookingStatus;
import com.eventticketplatform.bookingservice.exception.ResourceNotFoundException;
import com.eventticketplatform.bookingservice.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventServiceClient eventServiceClient;
    private final UserServiceClient userServiceClient;

    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto dto) {
        // Validate user exists (will throw Feign 404 → propagated as exception)
        userServiceClient.getUserById(dto.getUserId());

        // Fetch event and check availability
        EventDto event = eventServiceClient.getEventById(dto.getEventId());
        if (event.getAvailableSeats() < dto.getQuantity()) {
            throw new IllegalArgumentException(
                    "Not enough seats. Requested: " + dto.getQuantity()
                    + ", Available: " + event.getAvailableSeats());
        }

        // Deduct seats in event-service
        eventServiceClient.updateSeats(dto.getEventId(), -dto.getQuantity());

        // Persist booking
        Booking booking = new Booking();
        booking.setUserId(dto.getUserId());
        booking.setEventId(dto.getEventId());
        booking.setQuantity(dto.getQuantity());
        booking.setTotalAmount(event.getPrice().multiply(BigDecimal.valueOf(dto.getQuantity())));
        booking.setBookingDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.CONFIRMED);

        Booking saved = bookingRepository.save(booking);
        return toResponseDto(saved, event);
    }

    public List<BookingResponseDto> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(b -> {
                    EventDto event = eventServiceClient.getEventById(b.getEventId());
                    return toResponseDto(b, event);
                })
                .collect(Collectors.toList());
    }

    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> {
                    EventDto event = eventServiceClient.getEventById(b.getEventId());
                    return toResponseDto(b, event);
                })
                .collect(Collectors.toList());
    }

    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        EventDto event = eventServiceClient.getEventById(booking.getEventId());
        return toResponseDto(booking, event);
    }

    @Transactional
    public BookingResponseDto cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled.");
        }

        // Restore seats in event-service
        eventServiceClient.updateSeats(booking.getEventId(), booking.getQuantity());

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        EventDto event = eventServiceClient.getEventById(booking.getEventId());
        return toResponseDto(saved, event);
    }

    private BookingResponseDto toResponseDto(Booking booking, EventDto event) {
        BookingResponseDto dto = new BookingResponseDto();
        dto.setId(booking.getId());
        dto.setUserId(booking.getUserId());
        dto.setEventId(booking.getEventId());
        dto.setEventName(event.getName());
        dto.setEventVenue(event.getVenue());
        dto.setEventCity(event.getCity());
        dto.setEventDate(event.getEventDate());
        dto.setQuantity(booking.getQuantity());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setBookingDate(booking.getBookingDate());
        dto.setStatus(booking.getStatus());
        return dto;
    }
}
