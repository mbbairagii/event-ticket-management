package com.eventticketplatform.bookingservice.service;

import com.eventticketplatform.bookingservice.client.EventServiceClient;
import com.eventticketplatform.bookingservice.client.UserServiceClient;
import com.eventticketplatform.bookingservice.dto.BookingRequestDto;
import com.eventticketplatform.bookingservice.dto.BookingResponseDto;
import com.eventticketplatform.bookingservice.dto.EventDto;
import com.eventticketplatform.bookingservice.dto.UserDto;
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
        // 1. Validate user exists (will throw Feign 404 if user not found)
        UserDto user = userServiceClient.getUserById(dto.getUserId());

        if (user != null && user.getRole() != null && "ORGANIZER".equalsIgnoreCase(user.getRole())) {
            throw new IllegalArgumentException("Organizers cannot book tickets. Please use an attendee account.");
        }

        if (dto.getQuantity() == null || dto.getQuantity() <= 0) {
            throw new IllegalArgumentException("Booking quantity must be at least 1.");
        }

        // 2. Atomically check and deduct seats in event-service
        EventDto event = eventServiceClient.updateSeats(dto.getEventId(), -dto.getQuantity());

        try {
            // 3. Persist reservation in PENDING_PAYMENT state with 10-minute expiry
            Booking booking = new Booking();
            booking.setUserId(dto.getUserId());
            booking.setEventId(dto.getEventId());
            booking.setQuantity(dto.getQuantity());
            BigDecimal price = event.getPrice() != null ? event.getPrice() : BigDecimal.ZERO;
            booking.setTotalAmount(price.multiply(BigDecimal.valueOf(dto.getQuantity())));
            booking.setBookingDate(LocalDateTime.now());
            booking.setStatus(BookingStatus.PENDING_PAYMENT);
            booking.setExpiresAt(LocalDateTime.now().plusMinutes(5));

            Booking saved = bookingRepository.save(booking);
            return toResponseDto(saved, event);
        } catch (Exception ex) {
            // Compensating transaction: restore seats if booking persistence fails
            try {
                eventServiceClient.updateSeats(dto.getEventId(), dto.getQuantity());
            } catch (Exception rollbackEx) {
                // ignore
            }
            throw new IllegalStateException("Failed to create booking hold: " + ex.getMessage(), ex);
        }
    }


    @Transactional
    public BookingResponseDto confirmBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            EventDto event = eventServiceClient.getEventById(booking.getEventId());
            return toResponseDto(booking, event);
        }

        if (booking.getStatus() == BookingStatus.EXPIRED || booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalStateException("Cannot confirm booking. It has already been " + booking.getStatus());
        }

        // Check if reservation expired
        if (booking.getExpiresAt() != null && LocalDateTime.now().isAfter(booking.getExpiresAt())) {
            booking.setStatus(BookingStatus.EXPIRED);
            bookingRepository.save(booking);
            // Restore seats back to available pool
            eventServiceClient.updateSeats(booking.getEventId(), booking.getQuantity());
            throw new IllegalStateException("Booking reservation has expired. Held seats have been released.");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Booking saved = bookingRepository.save(booking);
        EventDto event = fetchEventSafe(saved.getEventId());
        return toResponseDto(saved, event);
    }

    public List<BookingResponseDto> getBookingsByUser(Long userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(b -> {
                    EventDto event = fetchEventSafe(b.getEventId());
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
                    EventDto event = fetchEventSafe(b.getEventId());
                    return toResponseDto(b, event);
                })
                .collect(Collectors.toList());
    }

    public List<BookingResponseDto> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> {
                    EventDto event = fetchEventSafe(b.getEventId());
                    return toResponseDto(b, event);
                })
                .collect(Collectors.toList());
    }

    public BookingResponseDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
        EventDto event = fetchEventSafe(booking.getEventId());
        return toResponseDto(booking, event);
    }

    private EventDto fetchEventSafe(Long eventId) {
        try {
            return eventServiceClient.getEventById(eventId);
        } catch (Exception ex) {
            return null;
        }
    }

    @Transactional
    public BookingResponseDto cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.EXPIRED) {
            return toResponseDto(booking, eventServiceClient.getEventById(booking.getEventId()));
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot cancel an already confirmed booking.");
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
        dto.setEventName(event != null ? event.getName() : "Event #" + booking.getEventId());
        dto.setEventVenue(event != null ? event.getVenue() : "");
        dto.setEventCity(event != null ? event.getCity() : "");
        dto.setEventDate(event != null ? event.getEventDate() : null);
        dto.setQuantity(booking.getQuantity());
        dto.setTotalAmount(booking.getTotalAmount());
        dto.setBookingDate(booking.getBookingDate());
        dto.setExpiresAt(booking.getExpiresAt());
        dto.setStatus(booking.getStatus());
        return dto;
    }
}