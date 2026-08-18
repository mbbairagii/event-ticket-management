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

    /**
     * Creates a new booking atomically.
     * Concurrency Safety: Invokes event-service which acquires a Pessimistic Write Lock
     * on the event row. If multiple users attempt to book the last available ticket simultaneously,
     * the database lock serializes the requests:
     * - The first user to acquire the lock reserves the ticket.
     * - The second user is rejected with a SOLD_OUT / NOT_ENOUGH_SEATS exception.
     */
    @Transactional
    public BookingResponseDto createBooking(BookingRequestDto dto) {
        // 1. Validate user exists (will throw Feign 404 if user not found)
        userServiceClient.getUserById(dto.getUserId());

        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("Booking quantity must be at least 1.");
        }

        // 2. Atomically check and deduct seats under exclusive database lock
        EventDto event = eventServiceClient.updateSeats(dto.getEventId(), -dto.getQuantity());

        // 3. Persist confirmed booking
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

    public List<BookingResponseDto> getBookingsByOrganizer(Long organizerId) {
        List<Long> eventIds = eventServiceClient.getEventIdsByOrganizer(organizerId);
        if (eventIds.isEmpty()) {
            return List.of();
        }
        return bookingRepository.findByEventIdIn(eventIds).stream()
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

        // Restore seats atomically in event-service
        EventDto event = eventServiceClient.updateSeats(booking.getEventId(), booking.getQuantity());

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
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