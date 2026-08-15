package com.eventticketplatform.userservice.controller;

import com.eventticketplatform.userservice.dto.UserLoginDto;
import com.eventticketplatform.userservice.dto.UserRegistrationDto;
import com.eventticketplatform.userservice.dto.UserResponseDto;
import com.eventticketplatform.userservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDto> register(@Valid @RequestBody UserRegistrationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<UserResponseDto> login(@Valid @RequestBody UserLoginDto dto) {
        return ResponseEntity.ok(userService.login(dto));
    }

    /**
     * Used internally by other microservices (via Feign) to validate/retrieve a user.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
