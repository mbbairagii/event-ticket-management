# 🎟️ Event Ticket Platform — Microservices Edition

> Full-stack event ticketing system — **Spring Boot microservices** backend + **React 19 + Vite** frontend. Browse events, reserve seats, pay via Razorpay, and cancel with tiered refunds.

---

## 🎯 About

A portfolio/learning project that shows how to build a production-shaped ticketing system from scratch. It covers microservice fundamentals (service discovery, API gateway, inter-service HTTP calls via Feign), real payment integration with Razorpay (including refunds), DDoS protection via a token-bucket rate limiter at the gateway, and the concurrency challenges unique to seat-reservation systems — specifically preventing overselling when multiple users compete for the last ticket.

The backend is split into four independently deployable services (User, Event, Booking, Payment), each with its own database. The React frontend has a concert-vibes dark UI with Framer Motion animations, geolocation-based event discovery, and a full booking + payment + refund flow.

> This is a prototype. See [Known Gaps](#-known-gaps-before-any-production-use) before using it in production.

---

## 🛠 Tech Stack

**Backend:** Java 17 · Spring Boot 3.3 · Spring Cloud (Eureka, Gateway, OpenFeign) · Spring Data JPA · MySQL 8 · Razorpay SDK · Lombok · Maven multi-module

**Frontend:** React 19 · Vite 8 · Tailwind CSS 4 · React Router v7 · Axios · Framer Motion · Lucide React

---

## 🏗 Architecture

```
Browser (React :5173)
        │
        ▼
  API Gateway :8080   ◄──── Eureka :8761 (service registry)
        │
        ├── /api/users/**    ──► User Service    :8081  →  users_db
        ├── /api/events/**   ──► Event Service   :8082  →  events_db
        ├── /api/bookings/** ──► Booking Service :8083  →  bookings_db
        └── /api/payments/** ──► Payment Service :8084  →  payments_db

Inter-service calls (OpenFeign, load-balanced via Eureka):
  Booking ──► User Service    (validate user exists, enforce roles)
  Booking ──► Event Service   (atomic seat deduction / restore)
  Payment ──► Booking Service (confirm booking after payment)
```

Each service owns its own database — no cross-service DB foreign keys.

---

## 🧩 Services at a Glance

| Service | Port | What it does |
|---|---:|---|
| **Eureka Server** | 8761 | Service registry |
| **API Gateway** | 8080 | Single entry point; routes all traffic; in-memory token-bucket **rate limiter** (30 req/s general, 5 req/s on auth paths) |
| **User Service** | 8085 | Register, login, user lookup. Roles: `USER` · `ORGANIZER` · `ADMIN` |
| **Event Service** | 8082 | Events CRUD, image uploads (≤20 MB), pagination/filtering, atomic seat management |
| **Booking Service** | 8083 | Seat reservation lifecycle; scheduler expires unpaid holds every 15 s |
| **Payment Service** | 8084 | Razorpay order creation + HMAC-SHA256 verification + **tiered refund** (100% / 50% / 0% by days-to-event) |
| **React Frontend** | 5173 | Web UI |

---

## ⚙️ Race Condition & Concurrency Handling

One of the core engineering challenges in a ticketing system: two users clicking "Book Now" at the same instant for the last available seat.

### Atomic seat deduction with conditional UPDATE

Instead of a read-then-write pattern (vulnerable to TOCTOU races), seat changes happen in a single atomic SQL `UPDATE` with a `WHERE` guard:

```sql
-- Deduct (booking): only succeeds if enough seats remain
UPDATE events SET available_seats = available_seats - :seats
WHERE id = :id AND available_seats >= :seats

-- Restore (cancel / expiry): only succeeds if it won't exceed total capacity
UPDATE events SET available_seats = available_seats + :seats
WHERE id = :id AND (available_seats + :seats) <= total_seats
```

If the `UPDATE` affects 0 rows, the database rejected the operation — no race, no oversell. The service reads back current state to return a descriptive error (`SOLD_OUT` or `NOT_ENOUGH_SEATS`).

### Pessimistic write lock available

`EventRepository` exposes `findByIdWithLock` (`SELECT … FOR UPDATE`) for scenarios requiring a row-level exclusive lock across a multi-step read-modify-write within a single transaction.

### Compensating transaction on booking failure

If seat deduction succeeds but the booking record fails to persist, a compensating call immediately restores the seats:

```java
EventDto event = eventServiceClient.updateSeats(eventId, -quantity); // deduct
try {
    bookingRepository.save(booking);
} catch (Exception ex) {
    eventServiceClient.updateSeats(eventId, quantity); // compensate
    throw ...;
}
```

### Idempotent booking confirmation

`confirmBooking` is idempotent — calling it on an already-`CONFIRMED` booking returns the existing record instead of erroring. Safe for retry-on-failure patterns.

### Expiry guard on confirmation

Even if the scheduler hasn't run yet, `confirmBooking` checks `expiresAt` at the moment of confirmation and transitions the booking to `EXPIRED` (releasing seats) if the window has passed.

### Booking expiry scheduler

`ExpiredBookingScheduler` runs every **15 seconds**, finds all `PENDING_PAYMENT` bookings past their `expiresAt`, marks them `EXPIRED`, and calls Event Service to restore seats. Each booking is handled in an isolated try-catch so one failure doesn't block the rest.

---

## 💳 Payment Flow (Razorpay)

```
1. User clicks "Pay"
2. POST /api/bookings           → status: PENDING_PAYMENT, seats deducted, 5-min expiry set
3. POST /api/payments/create-order → Razorpay order created on backend (secret never leaves server)
4. Razorpay modal opens in browser → user completes payment
5. POST /api/payments/verify    → backend verifies HMAC-SHA256 signature
                                 → on success: booking → CONFIRMED, payment record saved
6. 🎉 Booking Confirmed
```

> **Security:** Signature is verified with `razorpay.key-secret` on the backend only. The key is never sent to the browser.

### Refund Flow

```
1. User clicks "Cancel" on My Passes page
2. POST /api/payments/refund/{bookingId}
3. Backend checks days until event:
   > 7 days  → 100% refund
   3–7 days  → 50%  refund
   < 3 days  → ❌ no refund (72-hour window)
4. Razorpay refund API called (partial or full)
5. Booking cancelled + seats restored atomically
6. Payment status → REFUNDED, refund metadata persisted
```

---

## 🛡 DDoS Protection (Rate Limiting)

`RateLimitFilter` is a `GlobalFilter` on the API Gateway that runs at `order = -2` (before JWT validation):

| Path | Max burst | Refill rate |
|---|---|---|
| All general API paths | 60 requests | 30 req/s |
| `/api/users/login`, `/api/users/register` | 10 requests | 5 req/s |

- **Algorithm:** In-memory token-bucket per client IP (no Redis dependency).
- **IP resolution:** `X-Forwarded-For` → `X-Real-IP` → socket address.
- **Response:** HTTP 429 with `Retry-After: 1` and JSON error body.
- **Stale-bucket eviction:** Probabilistic (0.5%) cleanup — buckets idle >2 min are evicted.

---

## 📐 Data Models

<details>
<summary>Expand</summary>

### User
```
id · name · email (UNIQUE) · password · role ENUM(USER, ORGANIZER, ADMIN)
```

### Event
```
id · name · description · venue · city · eventDate · totalSeats · availableSeats · price · category · imageUrl · organizerId
```

### Booking
```
id · userId · eventId · quantity · totalAmount · bookingDate
status ENUM(PENDING_PAYMENT, CONFIRMED, CANCELLED, EXPIRED) · expiresAt
```

### Payment
```
id · bookingId · userId · razorpayOrderId · razorpayPaymentId · razorpaySignature
razorpayRefundId · refundAmount · refundDate
transactionId · amount · status ENUM(PENDING, COMPLETED, FAILED, REFUNDED) · paymentMethod · paymentDate
```

</details>

---

## 🖥 Frontend Routes

| Route | What's there |
|---|---|
| `/` | Hero, featured events, geolocation-based nearby events, ambient jazz toggle |
| `/events` | Paginated listing with name/city/category filters |
| `/events/:id` | Event details, seat picker, Razorpay modal |
| `/bookings` | My Passes — view and cancel bookings |
| `/dashboard` | Organizer/Admin event management (create/edit/delete) |
| `/login` · `/register` | Auth pages (USER or ORGANIZER registration) |

UI: Dark `#070709` background · neon-lime `#ccff00` accent · grain overlay · Framer Motion page transitions.

---

## 🚀 Quick Start

### Prerequisites

Java 17 · Maven 3.8+ · MySQL 8 · Node 20+ · npm 9+

### 1. Create databases

```sql
CREATE DATABASE users_db;
CREATE DATABASE events_db;
CREATE DATABASE bookings_db;
CREATE DATABASE payments_db;
```

> Tables are created automatically via `ddl-auto=update` on first run.

### 2. Start backend (in order)

```bash
cd eureka-server   && mvn spring-boot:run   # :8761 — start first
cd user-service    && mvn spring-boot:run   # :8081
cd event-service   && mvn spring-boot:run   # :8082
cd booking-service && mvn spring-boot:run   # :8083
cd payment-service && mvn spring-boot:run   # :8084
cd api-gateway     && mvn spring-boot:run   # :8080 — start last
```

### 3. Start frontend

```bash
cd react-frontend
npm install && npm run dev   # :5173
```

---

## ⚙️ Configuration

### Razorpay (Payment Service)

```properties
razorpay.key-id=${RAZORPAY_KEY_ID:rzp_test_replace_me}
razorpay.key-secret=${RAZORPAY_KEY_SECRET:replace_me}
```

Get test keys: [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys.

> ⚠️ Never commit real keys. Use env vars or a secrets manager.

### Database (all services)

```properties
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:3306/${DB_NAME}?useSSL=false&serverTimezone=UTC
spring.datasource.username=${DB_USER:root}
spring.datasource.password=${DB_PASSWORD:}
eureka.client.service-url.defaultZone=http://${EUREKA_HOST:localhost}:8761/eureka/
```

### Event image uploads

```properties
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
server.tomcat.max-http-form-post-size=20MB
```

---

## 📡 API Reference

All requests via the Gateway at `http://localhost:8080`.

**Users**
`POST /api/users/register` · `POST /api/users/login` · `GET /api/users/{id}`

**Events**
`GET /api/events` (`?name=&city=&category=&page=0&size=10`) · `GET /api/events/{id}` · `POST /api/events` · `PUT /api/events/{id}` · `DELETE /api/events/{id}` · `POST /api/events/upload`

**Bookings**
`POST /api/bookings` · `GET /api/bookings/{id}` · `GET /api/bookings/user/{userId}` · `GET /api/bookings/organizer/{organizerId}` · `PUT /api/bookings/{id}/confirm` · `PUT /api/bookings/{id}/cancel`

**Payments**
`POST /api/payments/create-order` · `POST /api/payments/verify` · `GET /api/payments/booking/{bookingId}` · `POST /api/payments/refund/{bookingId}`

<details>
<summary>Sample request bodies</summary>

**Register:** `{ "name": "Priya", "email": "p@x.com", "password": "secret", "role": "USER" }`

**Create booking:** `{ "userId": 1, "eventId": 5, "quantity": 2 }`

**Create order:** `{ "bookingId": 12, "userId": 1 }` — amount is pulled from the booking server-side.

**Verify payment:** `{ "razorpayOrderId": "order_xxx", "razorpayPaymentId": "pay_xxx", "razorpaySignature": "abc..." }`

</details>

---

## 👤 User Roles

| Role | Permissions |
|---|---|
| `USER` | Browse events, book & cancel own tickets |
| `ORGANIZER` | Above + create/edit/delete own events, view their bookings |
| `ADMIN` | Full access |


## 🔧 Troubleshooting

| Symptom | Fix |
|---|---|
| Port in use | `lsof -i :<port>` → `kill <PID>` |
| Gateway 503 | Check Eureka :8761; confirm service shows `UP`; verify `lb://` name matches |
| Payment 404 | Controller must map both `""` and `"/create-order"`: `@PostMapping({"", "/create-order"})` |
| Organizer role resets to USER | Run the `ALTER TABLE` ENUM fix above |
| Image upload fails | Confirm multipart limits in `event-service/application.properties` |
| Frontend shows no events | Test `http://localhost:8080/api/events` directly; check `src/services/api.js` base URL |

---


*Built with ☕ Java, ⚛️ React, and a lot of 🎶*

