package com.eventticketplatform.bookingservice.client;

import com.eventticketplatform.bookingservice.dto.EventDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Feign client for calling the Event Service.
 * The name "event-service" must match spring.application.name in that service.
 */
@FeignClient(name = "event-service")
public interface EventServiceClient {

    @GetMapping("/api/events/{id}")
    EventDto getEventById(@PathVariable("id") Long id);

    @PutMapping("/api/events/{id}/seats")
    EventDto updateSeats(@PathVariable("id") Long id, @RequestParam("seatsChange") int seatsChange);
}
