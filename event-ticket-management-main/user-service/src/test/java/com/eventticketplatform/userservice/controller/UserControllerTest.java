package com.eventticketplatform.userservice.controller;

import com.eventticketplatform.userservice.dto.UserLoginDto;
import com.eventticketplatform.userservice.dto.UserRegistrationDto;
import com.eventticketplatform.userservice.dto.UserResponseDto;
import com.eventticketplatform.userservice.entity.Role;
import com.eventticketplatform.userservice.exception.GlobalExceptionHandler;
import com.eventticketplatform.userservice.exception.ResourceNotFoundException;
import com.eventticketplatform.userservice.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Controller slice test — only the web layer is loaded, service is mocked.
 * No DB required. No full Spring context.
 */
@WebMvcTest(UserController.class)
@Import(GlobalExceptionHandler.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    // helper
    private UserResponseDto buildResponse(Long id, String name, String email, Role role) {
        UserResponseDto dto = new UserResponseDto();
        dto.setId(id);
        dto.setName(name);
        dto.setEmail(email);
        dto.setRole(role);
        return dto;
    }

    // POST /api/users/register

    @Test
    @DisplayName("POST /register: 201 on success")
    void register_returns201() throws Exception {
        UserRegistrationDto req = new UserRegistrationDto();
        req.setName("Alice");
        req.setEmail("alice@example.com");
        req.setPassword("secret123");

        when(userService.register(any())).thenReturn(buildResponse(1L, "Alice", "alice@example.com", Role.USER));

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("alice@example.com"));
    }

    @Test
    @DisplayName("POST /register: 400 when email is blank")
    void register_badRequest_blankEmail() throws Exception {
        UserRegistrationDto req = new UserRegistrationDto();
        req.setName("Alice");
        req.setEmail("");       // invalid
        req.setPassword("pass");

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /register: 400 when service throws IllegalArgumentException")
    void register_duplicateEmail_returns400() throws Exception {
        UserRegistrationDto req = new UserRegistrationDto();
        req.setName("Dup");
        req.setEmail("dup@example.com");
        req.setPassword("pass");

        when(userService.register(any())).thenThrow(new IllegalArgumentException("Email already registered"));

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // POST /api/users/login

    @Test
    @DisplayName("POST /login: 200 on success")
    void login_returns200() throws Exception {
        UserLoginDto req = new UserLoginDto();
        req.setEmail("carol@example.com");
        req.setPassword("password123");

        when(userService.login(any())).thenReturn(buildResponse(2L, "Carol", "carol@example.com", Role.USER));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("carol@example.com"));
    }

    @Test
    @DisplayName("POST /login: 404 when user not found")
    void login_notFound_returns404() throws Exception {
        UserLoginDto req = new UserLoginDto();
        req.setEmail("ghost@example.com");
        req.setPassword("pass");

        when(userService.login(any())).thenThrow(new ResourceNotFoundException("No user found"));

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    // GET /api/users/{id}

    @Test
    @DisplayName("GET /{id}: 200 with user body")
    void getById_returns200() throws Exception {
        when(userService.getUserById(5L)).thenReturn(buildResponse(5L, "Frank", "frank@example.com", Role.USER));

        mockMvc.perform(get("/api/users/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.name").value("Frank"));
    }

    @Test
    @DisplayName("GET /{id}: 404 when user not found")
    void getById_notFound_returns404() throws Exception {
        when(userService.getUserById(99L)).thenThrow(new ResourceNotFoundException("User not found"));

        mockMvc.perform(get("/api/users/99"))
                .andExpect(status().isNotFound());
    }
}
