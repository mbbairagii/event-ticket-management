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

    public Page<EventDto> getAllEvents(String name, String city, String category,Long organizerId, int page, int size) {
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
        return toDto(eventRepository.save(existing));
    }

    public void deleteEvent(Long id) {
        findEventOrThrow(id);
        eventRepository.deleteById(id);
    }

    /**
     * Called internally by the Booking Service to update seat availability.
     * seatsChange is negative when booking (deduct) and positive when cancelling (restore).
     */
    @Transactional
    public EventDto updateSeats(Long id, int seatsChange) {
        Event event = findEventOrThrow(id);
        int newAvailable = event.getAvailableSeats() + seatsChange;
        if (newAvailable < 0) {
            throw new IllegalArgumentException("Not enough seats available. Requested: "
                    + (-seatsChange) + ", Available: " + event.getAvailableSeats());
        }
        if (newAvailable > event.getTotalSeats()) {
            throw new IllegalArgumentException("Cannot restore more seats than total seats.");
        }
        event.setAvailableSeats(newAvailable);
        return toDto(eventRepository.save(event));
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
        return event;
    }
}
