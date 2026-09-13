package com.eventticketplatform.bookingservice.client;

import com.eventticketplatform.bookingservice.dto.UserDto;
import org.springframework.stereotype.Component;

/**
 * Feign fallback for UserServiceClient.
 *
 * The JWT is already validated at the API Gateway, so if user-service is
 * temporarily unavailable (503 / connection refused) we return null and let
 * BookingService proceed without the secondary role-check.
 * This eliminates the 503 propagation to the end user.
 */
@Component
public class UserServiceClientFallback implements UserServiceClient {

    @Override
    public UserDto getUserById(Long id) {
        // null => BookingService skips role-check (JWT already authenticated the caller)
        return null;
    }
}
