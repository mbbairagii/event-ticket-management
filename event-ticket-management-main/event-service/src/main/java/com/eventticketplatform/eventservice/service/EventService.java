package com.eventticketplatform.eventservice.service;

import com.eventticketplatform.eventservice.dto.EventDto;
import com.eventticketplatform.eventservice.entity.Event;
import com.eventticketplatform.eventservice.exception.ResourceNotFoundException;
import com.eventticketplatform.eventservice.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;

    public Page<EventDto> getAllEvents(String name, String city, String category, Long organizerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("eventDate").ascending());
        return eventRepository.findByFilters(
                (name != null && !name.isBlank()) ? name : null,
                (city != null && !city.isBlank()) ? city : null,
                (category != null && !category.isBlank()) ? category : null,
                organizerId,
                pageable
        ).map(this::toDto);
    }

    public EventDto getEventById(Long id) {
        return toDto(findEventOrThrow(id));
    }

    /**
     * Internal endpoint: called by Booking Service via Feign to find which
     * events belong to a given organizer, so it can look up their bookings.
     */
    public java.util.List<Long> getEventIdsByOrganizer(Long organizerId) {
        return eventRepository.findIdsByOrganizerId(organizerId);
    }

    public EventDto createEvent(EventDto dto) {
        Event event = toEntity(dto);
        event.setAvailableSeats(dto.getTotalSeats());
        return toDto(eventRepository.save(event));
    }

    public EventDto updateEvent(Long id, EventDto dto) {
        Event existing = findEventOrThrow(id);
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setVenue(dto.getVenue());
        existing.setCity(dto.getCity());
        existing.setEventDate(dto.getEventDate());
        existing.setTotalSeats(dto.getTotalSeats());
        existing.setPrice(dto.getPrice());
        existing.setCategory(dto.getCategory());
        existing.setImageUrl(dto.getImageUrl());
        return toDto(eventRepository.save(existing));
    }

    public void deleteEvent(Long id) {
        Event event = findEventOrThrow(id);

        // Safeguard against deleting events that have active attendee bookings
        if (event.getAvailableSeats() != null && event.getTotalSeats() != null 
                && event.getAvailableSeats() < event.getTotalSeats()) {
            int bookedSeats = event.getTotalSeats() - event.getAvailableSeats();
            throw new IllegalArgumentException(
                "Cannot delete event: " + bookedSeats + " ticket(s) have already been booked by attendees. "
                + "Please cancel or refund attendee bookings before deleting this show."
            );
        }

        eventRepository.deleteById(id);
    }

    /**
     * Called internally by the Booking Service to update seat availability.
     * seatsChange is negative when booking (deduct) and positive when cancelling (restore).
     * 
     * Uses Pessimistic Write Locking (SELECT ... FOR UPDATE) to guarantee atomic, thread-safe
     * seat reservations and eliminate race conditions when multiple users compete for the last ticket.
     */
    @Transactional
    public EventDto updateSeats(Long id, int seatsChange) {
        if (seatsChange == 0) {
            return toDto(findEventOrThrow(id));
        }

        // Deducting seats (Booking)
        if (seatsChange < 0) {
            int quantityToDeduct = -seatsChange;

            // Lock event row exclusively for update
            Event event = eventRepository.findByIdWithLock(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

            if (event.getAvailableSeats() == null || event.getAvailableSeats() <= 0) {
                throw new IllegalArgumentException("SOLD_OUT: This event is completely sold out. No tickets remaining.");
            }

            if (event.getAvailableSeats() < quantityToDeduct) {
                throw new IllegalArgumentException("NOT_ENOUGH_SEATS: Only " + event.getAvailableSeats() 
                        + " ticket(s) remaining. Cannot fulfill request for " + quantityToDeduct + " tickets.");
            }

            event.setAvailableSeats(event.getAvailableSeats() - quantityToDeduct);
            Event saved = eventRepository.save(event);
            return toDto(saved);
        } else {
            // Restoring seats (Cancellation)
            Event event = eventRepository.findByIdWithLock(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

            int newAvailable = (event.getAvailableSeats() != null ? event.getAvailableSeats() : 0) + seatsChange;
            if (newAvailable > event.getTotalSeats()) {
                throw new IllegalArgumentException("Cannot restore more seats than total seats capacity.");
            }
            event.setAvailableSeats(newAvailable);
            Event saved = eventRepository.save(event);
            return toDto(saved);
        }
    }

    private Event findEventOrThrow(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    private EventDto toDto(Event event) {
        EventDto dto = new EventDto();
        dto.setId(event.getId());
        dto.setName(event.getName());
        dto.setDescription(event.getDescription());
        dto.setVenue(event.getVenue());
        dto.setCity(event.getCity());
        dto.setEventDate(event.getEventDate());
        dto.setTotalSeats(event.getTotalSeats());
        dto.setAvailableSeats(event.getAvailableSeats());
        dto.setPrice(event.getPrice());
        dto.setCategory(event.getCategory());
        dto.setImageUrl(event.getImageUrl());
        dto.setOrganizerId(event.getOrganizerId());
        return dto;
    }

    private Event toEntity(EventDto dto) {
        Event event = new Event();
        event.setName(dto.getName());
        event.setOrganizerId(dto.getOrganizerId());
        event.setDescription(dto.getDescription());
        event.setVenue(dto.getVenue());
        event.setCity(dto.getCity());
        event.setEventDate(dto.getEventDate());
        event.setTotalSeats(dto.getTotalSeats());
        event.setPrice(dto.getPrice());
        event.setCategory(dto.getCategory());
        event.setImageUrl(dto.getImageUrl());
        return event;
    }
}