package com.eventticketplatform.userservice.service;

import com.eventticketplatform.userservice.dto.UserLoginDto;
import com.eventticketplatform.userservice.dto.UserRegistrationDto;
import com.eventticketplatform.userservice.dto.UserResponseDto;
import com.eventticketplatform.userservice.entity.Role;
import com.eventticketplatform.userservice.entity.User;
import com.eventticketplatform.userservice.exception.ResourceNotFoundException;
import com.eventticketplatform.userservice.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // register()

    @Test
    @DisplayName("register: success returns correct fields")
    void register_success() {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setName("Alice");
        dto.setEmail("alice@example.com");
        dto.setPassword("secret123");
        dto.setRole(Role.USER);

        when(userRepository.existsByEmail("alice@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UserResponseDto result = userService.register(dto);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Alice");
        assertThat(result.getEmail()).isEqualTo("alice@example.com");
        assertThat(result.getRole()).isEqualTo(Role.USER);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("register: ORGANIZER role is preserved")
    void register_organizerRole() {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setName("Bob");
        dto.setEmail("bob@example.com");
        dto.setPassword("pass");
        dto.setRole(Role.ORGANIZER);

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User u = inv.getArgument(0);
            u.setId(2L);
            return u;
        });

        UserResponseDto result = userService.register(dto);
        assertThat(result.getRole()).isEqualTo(Role.ORGANIZER);
    }

    @Test
    @DisplayName("register: throws IllegalArgumentException when email exists")
    void register_duplicateEmail_throws() {
        UserRegistrationDto dto = new UserRegistrationDto();
        dto.setName("Dup");
        dto.setEmail("dup@example.com");
        dto.setPassword("pass");

        when(userRepository.existsByEmail("dup@example.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.register(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dup@example.com");
        verify(userRepository, never()).save(any());
    }

    // login()

    @Test
    @DisplayName("login: success with BCrypt password")
    void login_success_bcrypt() {
        String raw = "password123";
        User user = buildUser(1L, "Carol", "carol@example.com", encoder.encode(raw), Role.USER);
        when(userRepository.findByEmail("carol@example.com")).thenReturn(Optional.of(user));

        UserLoginDto dto = new UserLoginDto();
        dto.setEmail("carol@example.com");
        dto.setPassword(raw);

        UserResponseDto result = userService.login(dto);
        assertThat(result.getEmail()).isEqualTo("carol@example.com");
    }

    @Test
    @DisplayName("login: legacy plaintext password is upgraded to BCrypt")
    void login_legacyPlaintextUpgrade() {
        String raw = "legacypass";
        User user = buildUser(2L, "Dave", "dave@example.com", raw, Role.USER);
        when(userRepository.findByEmail("dave@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserLoginDto dto = new UserLoginDto();
        dto.setEmail("dave@example.com");
        dto.setPassword(raw);

        userService.login(dto);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("login: throws ResourceNotFoundException when email not found")
    void login_emailNotFound_throws() {
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        UserLoginDto dto = new UserLoginDto();
        dto.setEmail("nobody@example.com");
        dto.setPassword("any");

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("login: throws IllegalArgumentException for wrong password")
    void login_wrongPassword_throws() {
        User user = buildUser(3L, "Eve", "eve@example.com", encoder.encode("correct"), Role.USER);
        when(userRepository.findByEmail("eve@example.com")).thenReturn(Optional.of(user));

        UserLoginDto dto = new UserLoginDto();
        dto.setEmail("eve@example.com");
        dto.setPassword("wrong");

        assertThatThrownBy(() -> userService.login(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid email or password");
    }

    // getUserById()

    @Test
    @DisplayName("getUserById: returns dto for existing user")
    void getUserById_found() {
        User user = buildUser(10L, "Frank", "frank@example.com", "hashed", Role.USER);
        when(userRepository.findById(10L)).thenReturn(Optional.of(user));

        UserResponseDto result = userService.getUserById(10L);
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("Frank");
    }

    @Test
    @DisplayName("getUserById: throws ResourceNotFoundException for missing id")
    void getUserById_notFound_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    // helpers

    private User buildUser(Long id, String name, String email, String password, Role role) {
        User u = new User();
        u.setId(id);
        u.setName(name);
        u.setEmail(email);
        u.setPassword(password);
        u.setRole(role);
        return u;
    }
}
