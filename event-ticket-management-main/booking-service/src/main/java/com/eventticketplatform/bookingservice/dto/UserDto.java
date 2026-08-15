package com.eventticketplatform.bookingservice.dto;

import lombok.Data;

/**
 * Mirrors UserResponseDto from user-service — used as Feign response model.
 */
@Data
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
}
