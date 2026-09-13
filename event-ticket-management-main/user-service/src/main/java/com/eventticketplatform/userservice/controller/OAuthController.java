package com.eventticketplatform.userservice.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Simple controller that starts the Google OAuth flow.
 * The front‑end can call /auth/google (GET) and will be redirected to the
 * Spring Security OAuth2 authorization endpoint.
 */
@Controller
public class OAuthController {

    @GetMapping("/auth/google")
    public void redirectToGoogle(HttpServletResponse response) throws IOException {
        // Spring Security's default endpoint for initiating the flow is
        // /oauth2/authorization/{registrationId}. Here registrationId == "google".
        response.sendRedirect("/oauth2/authorization/google");
    }
}
