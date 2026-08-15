package com.eventticketplatform.userservice.dto;

import com.eventticketplatform.userservice.entity.Role;
import lombok.Data;

@Data
public class UserResponseDto {
    private Long id;
    private String name;
    private String email;
    private Role role;
}
