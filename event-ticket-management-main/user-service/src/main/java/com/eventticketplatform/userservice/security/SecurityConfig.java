package com.eventticketplatform.userservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

// Import the custom success handler
import com.eventticketplatform.userservice.security.GoogleOAuthSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final GoogleOAuthSuccessHandler successHandler;

    public SecurityConfig(GoogleOAuthSuccessHandler successHandler) {
        this.successHandler = successHandler;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .authorizeHttpRequests(auth -> auth
                // Permit the OAuth2 flow endpoints
                .requestMatchers("/login/oauth2/**", "/oauth2/**", "/auth/google/**").permitAll()
                // Permit all API calls - JWT auth is handled by the API gateway
                .requestMatchers("/api/**").permitAll()
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("http://localhost:5173/oauth-callback", true)
                .successHandler(successHandler)
            );
        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
