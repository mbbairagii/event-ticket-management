package com.eventticketplatform.userservice.repository;

import com.eventticketplatform.userservice.entity.Role;
import com.eventticketplatform.userservice.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

/**
 * Repository slice test — only JPA layer is loaded.
 * Uses in-memory H2 defined in application-test.properties (with MODE=MySQL).
 * Replace.NONE prevents @DataJpaTest from overriding our configured datasource URL.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    private User createUser(String name, String email) {
        User u = new User();
        u.setName(name);
        u.setEmail(email);
        u.setPassword("hashed");
        u.setRole(Role.USER);
        return userRepository.save(u);
    }

    @Test
    @DisplayName("findByEmail: returns user when email matches")
    void findByEmail_found() {
        createUser("Alice", "alice@test.com");

        Optional<User> result = userRepository.findByEmail("alice@test.com");

        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("alice@test.com");
    }

    @Test
    @DisplayName("findByEmail: returns empty when email not found")
    void findByEmail_notFound() {
        Optional<User> result = userRepository.findByEmail("ghost@test.com");
        assertThat(result).isEmpty();
    }

    @Test
    @DisplayName("existsByEmail: returns true for existing email")
    void existsByEmail_true() {
        createUser("Bob", "bob@test.com");
        assertThat(userRepository.existsByEmail("bob@test.com")).isTrue();
    }

    @Test
    @DisplayName("existsByEmail: returns false for missing email")
    void existsByEmail_false() {
        assertThat(userRepository.existsByEmail("nobody@test.com")).isFalse();
    }

    @Test
    @DisplayName("save: persists all fields correctly")
    void save_persistsFields() {
        User u = new User();
        u.setName("Carol");
        u.setEmail("carol@test.com");
        u.setPassword("bcrypt_hash");
        u.setRole(Role.ORGANIZER);

        User saved = userRepository.save(u);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getName()).isEqualTo("Carol");
        assertThat(saved.getRole()).isEqualTo(Role.ORGANIZER);
    }

    @Test
    @DisplayName("findById: returns user for valid id")
    void findById_found() {
        User saved = createUser("Dave", "dave@test.com");
        Optional<User> result = userRepository.findById(saved.getId());
        assertThat(result).isPresent();
    }

    @Test
    @DisplayName("findById: empty for unknown id")
    void findById_notFound() {
        Optional<User> result = userRepository.findById(999L);
        assertThat(result).isEmpty();
    }
}
