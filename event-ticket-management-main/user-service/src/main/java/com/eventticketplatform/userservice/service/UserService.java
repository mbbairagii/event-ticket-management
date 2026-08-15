package com.eventticketplatform.userservice.service;

import com.eventticketplatform.userservice.dto.UserLoginDto;
import com.eventticketplatform.userservice.dto.UserRegistrationDto;
import com.eventticketplatform.userservice.dto.UserResponseDto;
import com.eventticketplatform.userservice.entity.Role;
import com.eventticketplatform.userservice.entity.User;
import com.eventticketplatform.userservice.exception.ResourceNotFoundException;
import com.eventticketplatform.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserResponseDto register(UserRegistrationDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException(
                    "Email already registered: " + dto.getEmail()
            );
        }

        User user = new User();

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());

        System.out.println("RECEIVED ROLE: " + dto.getRole());
        Role requestedRole = dto.getRole();

        if (requestedRole == Role.ORGANIZER) {
            user.setRole(Role.ORGANIZER);
        } else {
            user.setRole(Role.USER);
        }

        System.out.println("ROLE BEFORE SAVE: " + user.getRole());
        User saved = userRepository.save(user);

        return toResponseDto(saved);
    }

    public UserResponseDto login(UserLoginDto dto) {
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "No user found with email: "
                                        + dto.getEmail()
                        )
                );

        if (!user.getPassword().equals(dto.getPassword())) {
            throw new IllegalArgumentException(
                    "Invalid credentials"
            );
        }

        return toResponseDto(user);
    }

    public UserResponseDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found with id: " + id
                        )
                );

        return toResponseDto(user);
    }

    private UserResponseDto toResponseDto(User user) {
        UserResponseDto dto = new UserResponseDto();

        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());

        return dto;
    }
}