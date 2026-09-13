package com.eventticketplatform.userservice.security;

import com.eventticketplatform.userservice.entity.User;
import com.eventticketplatform.userservice.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Component
public class GoogleOAuthSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;

    @Value("${jwt.secret:eventified-default-secret-change-in-production-32chars}")
    private String jwtSecret;

    // token valid for 1 day
    private static final long JWT_EXPIRATION_MS = 86_400_000L;

    public GoogleOAuthSuccessHandler(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        DefaultOAuth2User oauthUser = (DefaultOAuth2User) authentication.getPrincipal();
        Map<String, Object> attrs = oauthUser.getAttributes();

        String googleId = (String) attrs.get("sub");
        String email = (String) attrs.get("email");
        String name = (String) attrs.get("name");

        // find existing user or create a new one
        User user = userRepository.findByGoogleId(googleId)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setGoogleId(googleId);
                    newUser.setEmail(email);
                    newUser.setName(name);
                    // password left null for OAuth users
                    return userRepository.save(newUser);
                });

        // build JWT
        Date now = Date.from(Instant.now());
        Date expiry = new Date(now.getTime() + JWT_EXPIRATION_MS);
        String jwt = Jwts.builder()
                .setSubject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("name", user.getName())
                .claim("role", user.getRole().name())
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(SignatureAlgorithm.HS256, jwtSecret.getBytes())
                .compact();

        response.sendRedirect("http://localhost:5173/oauth-callback?token=" + jwt
                + "&id=" + user.getId()
                + "&name=" + java.net.URLEncoder.encode(user.getName() != null ? user.getName() : "", "UTF-8")
                + "&email=" + java.net.URLEncoder.encode(user.getEmail(), "UTF-8")
                + "&role=" + user.getRole().name());
    }
}
