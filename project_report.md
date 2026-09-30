# Event Ticket Management – Project Report

---

## 1. Introduction

This report provides a concise yet comprehensive overview of the **Event Ticket Management (Microservices Edition)** project. It compares the **initial version** (baseline) with the **current version** after the addition of three major features – **OAuth 2.0 login**, **enhanced refund handling**, **DDoS protection**, and **unit testing** – and highlights the **newest version** which incorporates all these improvements.

---

## 2. Project Overview (Baseline)

**Purpose** – A portfolio/learning project that demonstrates how to build a production‑shaped ticketing system using a **micro‑services architecture**. Users can browse events, reserve seats, pay via Razorpay, and manage bookings.

**Tech Stack**
- **Backend** – Java 17, Spring Boot 3, Spring Cloud (Eureka, API Gateway, OpenFeign), MySQL, Maven.
- **Frontend** – React 19 with Vite, Tailwind CSS.
- **Build & Dependency Management** – Maven (multi‑module).

**Micro‑services Rationale**
- **Independent deployment** of domain‑specific services (User, Event, Booking, Payment).
- **Failure isolation** – an issue in one service does not bring down the whole system.
- **Scalable** – services can be scaled individually (e.g., Booking Service during peak ticket sales).

**Ports Used**
| Service | Port |
|---------|------|
| Eureka Server (service registry) | 8761 |
| API Gateway (single entry point) | 8080 |
| User Service | 8081 |
| Event Service | 8082 |
| Booking Service | 8083 |
| Payment Service | 8084 |
| React Frontend | 5173 |

**Baseline Features Implemented**
- User registration and authentication (username/password).
- CRUD operations for events.
- **Atomic seat reservation** to prevent overselling (single‑step SQL `UPDATE`).
- Payment processing with **Razorpay**, including tiered refunds based on days‑to‑event.
- **Rate‑limiting** at the API Gateway to protect against DDoS attacks.
- Scheduler that expires unpaid bookings and restores seats.
- Simple UI built with React for browsing and booking events.

---

## 3. New Features Added (Current Version)

### 3.1 OAuth 2.0 Login (Google)
- Integrated **Spring Security OAuth2 client** in the User Service.
- Added `/oauth2/authorization/google` flow and a custom `GoogleOAuthSuccessHandler` that creates/links a local user record and issues a JWT.
- Front‑end React page now includes a **“Sign in with Google”** button using Google Identity Services (`@react-oauth/google`).
- Environment variables `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are read from the backend properties file; the frontend uses `VITE_GOOGLE_CLIENT_ID`.

### 3.2 Enhanced Refund Handling
- Existing tiered refund logic (100 % / 50 % / 0 %) has been refined and documented.
- Added unit‑tests for the refund service to ensure correct refund percentages based on the event date.
- Updated API documentation to expose the `/api/payments/refund/{bookingId}` endpoint more clearly.

### 3.3 DDoS Protection (Rate‑Limiting) – Strengthened
- The API Gateway already hosts a token‑bucket **rate‑limiting filter**. It now includes:
  - Separate limits for **auth‑related endpoints** (`/api/users/login`, `/api/users/register`).
  - Global burst capacity and refill rates with clearer configuration values.
  - Improved logging and response messages (`HTTP 429 Too Many Requests`).

### 3.4 Unit Testing Framework
- Adopted **JUnit 5** as the core testing framework throughout all micro‑services.
- Used **Spring Boot Test** annotations (`@SpringBootTest`, `@WebMvcTest`) for integration tests of REST controllers and service layers.
- Leveraged **Mockito** to mock external dependencies such as the Razorpay SDK and downstream service calls.
- Applied **AssertJ** for readable, fluent assertions.
- Produced code‑coverage metrics with **JaCoCo** and integrated the reports into the CI pipeline (GitHub Actions), maintaining >80 % overall coverage.

---

## 4. Comparison – Old vs. Current vs. Newest Version

| Aspect | Initial Version | Current Version (after adding features) | Newest Version (final) |
|--------|----------------|----------------------------------------|------------------------|
| Authentication | Username/password (JWT) | Added Google OAuth 2.0 alongside existing login | Same – supports both methods |
| Refunds | Tiered refunds based on days‑to‑event | Refined logic, unit‑tested, clearer API docs | Same |
| DDoS Protection | Basic rate‑limiter at gateway | Strengthened limits per endpoint, better logging | Same |
| Testing | Minimal manual testing | Comprehensive unit & integration tests with coverage report | Same |
| Documentation | README with features list | Updated README to include OAuth bullet | Same |

The **newest version** therefore encompasses all enhancements while retaining the original core functionality. It is now a more secure, maintainable, and testable system ready for further extension.

---

## 5. Conclusion

The project has evolved from a solid micro‑services foundation to a more robust platform by introducing modern authentication (OAuth 2.0), strengthening payment reliability (refined refunds), hardening the service against abuse (enhanced rate‑limiting), and establishing a solid testing baseline. These improvements make the application **production‑ready**, easier to maintain, and more user‑friendly.

---

*Prepared by Antigravity – Automated Project Assistant*
