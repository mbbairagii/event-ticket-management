package com.eventticketplatform.eventservice.controller;

import com.eventticketplatform.eventservice.dto.EventDto;
import com.eventticketplatform.eventservice.service.EventService;
import com.eventticketplatform.eventservice.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final FileStorageService fileStorageService;

    @GetMapping
    public ResponseEntity<Page<EventDto>> getAllEvents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long organizerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(eventService.getAllEvents(name, city, category, organizerId, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDto> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    /**
     * Upload an event poster image file (JPEG, PNG, WebP, etc.).
     * Saves the file to disk and returns the accessible image URL.
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadPoster(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Please select a file to upload."));
        }
        String fileName = fileStorageService.storeFile(file);
        // Returns the API Gateway routed image URL
        String fileDownloadUri = "http://localhost:8080/api/events/images/" + fileName;
        return ResponseEntity.ok(Collections.singletonMap("imageUrl", fileDownloadUri));
    }

    /**
     * Serves uploaded poster images with appropriate Content-Type.
     */
    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> getPosterImage(@PathVariable String fileName, HttpServletRequest request) {
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            // fallback
        }

        if (contentType == null) {
            contentType = "application/octet-stream";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    /**
     * Internal endpoint: called by Booking Service via Feign to find which
     * event IDs belong to a given organizer.
     */
    @GetMapping("/organizer/{organizerId}/ids")
    public ResponseEntity<java.util.List<Long>> getEventIdsByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(eventService.getEventIdsByOrganizer(organizerId));
    }

    @PostMapping
    public ResponseEntity<EventDto> createEvent(@Valid @RequestBody EventDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventDto> updateEvent(@PathVariable Long id, @Valid @RequestBody EventDto dto) {
        return ResponseEntity.ok(eventService.updateEvent(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Internal endpoint: called by Booking Service via Feign to update seat count.
     * seatsChange: negative to book, positive to cancel/restore.
     */
    @PutMapping("/{id}/seats")
    public ResponseEntity<EventDto> updateSeats(@PathVariable Long id,
                                                @RequestParam int seatsChange) {
        return ResponseEntity.ok(eventService.updateSeats(id, seatsChange));
    }
}