package com.eventticketplatform.bookingservice.exception;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArg(IllegalArgumentException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(err ->
                errors.put(err.getField(), err.getDefaultMessage()));
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Intercepts Feign exceptions when downstream microservices (e.g. Event Service)
     * reject a booking due to sold out status or race-condition seat depletion.
     */
    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> handleFeignException(FeignException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());

        int statusCode = ex.status() > 0 ? ex.status() : HttpStatus.BAD_REQUEST.value();
        body.put("status", statusCode);

        String errorMsg = "Downstream service error";
        try {
            if (ex.contentUTF8() != null && !ex.contentUTF8().isBlank()) {
                String content = ex.contentUTF8();
                if (content.contains("\"error\":\"")) {
                    int start = content.indexOf("\"error\":\"") + 9;
                    int end = content.indexOf("\"", start);
                    if (end > start) {
                        errorMsg = content.substring(start, end);
                    } else {
                        errorMsg = content;
                    }
                } else if (content.contains("\"message\":\"")) {
                    int start = content.indexOf("\"message\":\"") + 11;
                    int end = content.indexOf("\"", start);
                    if (end > start) {
                        errorMsg = content.substring(start, end);
                    } else {
                        errorMsg = content;
                    }
                } else {
                    errorMsg = content;
                }
            } else if (ex.getMessage() != null) {
                errorMsg = ex.getMessage();
            }
        } catch (Exception ignored) {
            errorMsg = ex.getMessage();
        }

        body.put("error", errorMsg);
        return ResponseEntity.status(statusCode).body(body);
    }
}
