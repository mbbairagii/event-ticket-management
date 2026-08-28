# Event Ticket Platform — Microservices Edition

A Spring Cloud microservices application for discovering events, booking tickets, and processing payments.

## Architecture

```text
React :5173 ──┐
Angular :4200 ─┼──► API Gateway :8080
               │       ├── user-service    :8081 → users_db
               │       ├── event-service   :8082 → events_db
               │       ├── booking-service :8083 → bookings_db
               │       └── payment-service :8084 → payments_db
               │
               └──► Eureka Server :8761
```

## Services

| Service | Port | Database | Responsibility |
|---|---:|---|---|
| Eureka Server | 8761 | None | Service discovery |
| API Gateway | 8080 | None | Routes frontend API requests |
| User Service | 8081 | `users_db` | Registration, login, and user lookup |
| Event Service | 8082 | `events_db` | Event creation and management |
| Booking Service | 8083 | `bookings_db` | Ticket bookings and cancellations |
| Payment Service | 8084 | `payments_db` | Payment records and Razorpay integration |
| React Frontend | 5173 | None | React/Vite web application |
| Angular Frontend | 4200 | None | Angular web application |

Each service owns its own database. Cross-service relationships use IDs and service-to-service calls instead of database foreign keys.

## Requirements

Install:

- Java 17+
- Maven
- MySQL
- Node.js and npm
- Docker Desktop, optional
- Angular CLI, only if using the Angular frontend

Create the MySQL databases:

```sql
CREATE DATABASE users_db;
CREATE DATABASE events_db;
CREATE DATABASE bookings_db;
CREATE DATABASE payments_db;
```

## Run locally

Start services in this order:

### Eureka Server

```bash
cd eureka-server
mvn spring-boot:run
```

Open `http://localhost:8761`.

### User Service

```bash
cd user-service
mvn spring-boot:run
```

Runs on `http://localhost:8081`.

### Event Service

```bash
cd event-service
mvn spring-boot:run
```

Runs on `http://localhost:8082`.

### Booking Service

```bash
cd booking-service
mvn spring-boot:run
```

Runs on `http://localhost:8083`.

### Payment Service

```bash
cd payment-service
mvn spring-boot:run
```

Runs on `http://localhost:8084`.

### API Gateway

```bash
cd api-gateway
mvn spring-boot:run
```

Runs on `http://localhost:8080`.

The Gateway should be started after Eureka and the backend services so that all services can register before frontend requests begin.

## Frontend setup

### React

```bash
cd react-frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

The React API base URL is:

```text
http://localhost:8080/api
```

### Angular

```bash
cd angular-frontend
npm install
ng serve
```

Open `http://localhost:4200`.

Both frontends communicate through the API Gateway. No frontend URL change is required while the Gateway remains on port `8080`.

## API reference

All API calls should go through:

```text
http://localhost:8080
```

### Users

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/users/register` | Register a user or organizer |
| `POST` | `/api/users/login` | Log in |
| `GET` | `/api/users/{id}` | Get a user by ID |

Registration request:

```json
{
  "name": "Mohini",
  "email": "mohini@example.com",
  "password": "password",
  "role": "ORGANIZER"
}
```

Supported roles:

```text
USER
ORGANIZER
ADMIN
```

Public registration should allow `USER` and `ORGANIZER`. `ADMIN` should be assigned only through secure administrative operations.

### Events

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | List events |
| `GET` | `/api/events/{id}` | Get an event |
| `POST` | `/api/events` | Create an event |
| `PUT` | `/api/events/{id}` | Update an event |
| `DELETE` | `/api/events/{id}` | Delete an event |

Event filters:

```text
/api/events?name=&city=&category=&page=0&size=10
```

Event creation request:

```json
{
  "name": "Music Festival",
  "description": "Live music event",
  "venue": "City Arena",
  "city": "Mumbai",
  "eventDate": "2026-09-20T18:30:00",
  "totalSeats": 500,
  "availableSeats": 500,
  "price": 1500.00,
  "category": "Music"
}
```

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/bookings` | Create a booking |
| `GET` | `/api/bookings/user/{userId}` | Get a user’s bookings |
| `GET` | `/api/bookings/organizer/{organizerId}` | Get bookings for an organizer’s events |
| `GET` | `/api/bookings` | Get all bookings |
| `GET` | `/api/bookings/{id}` | Get a booking |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/payments/create-order` | Create a Razorpay order |
| `POST` | `/api/payments` | Record or confirm a payment |
| `GET` | `/api/payments/booking/{bookingId}` | Get payment by booking |

For Razorpay, order amounts must be sent in paise:

```text
₹1,500 = 150000 paise
```

Order creation must happen on the backend. Never expose the Razorpay secret key in the frontend.

## Inter-service communication

### Booking Service

Booking Service uses OpenFeign to call:

- User Service, to verify the user.
- Event Service, to fetch event information.
- Event Service, to decrease or restore available seats.

### Payment Service

Payment Service uses OpenFeign to call:

- Booking Service, to verify booking ownership and status.

Services store external IDs as ordinary columns. They do not use database foreign keys across service databases.

## Gateway routing

The API Gateway routes requests through Eureka service discovery:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**

        - id: event-service
          uri: lb://event-service
          predicates:
            - Path=/api/events/**

        - id: booking-service
          uri: lb://booking-service
          predicates:
            - Path=/api/bookings/**

        - id: payment-service
          uri: lb://payment-service
          predicates:
            - Path=/api/payments/**
```

The API Gateway requires:

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-loadbalancer</artifactId>
</dependency>
```

## Configuration

Example payment-service configuration:

```properties
spring.application.name=payment-service
server.port=8084

spring.datasource.url=jdbc:mysql://localhost:3306/payments_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

eureka.client.service-url.defaultZone=http://localhost:8761/eureka/
eureka.instance.prefer-ip-address=true
```

Razorpay credentials belong only in backend configuration:

```properties
razorpay.key-id=rzp_test_replace_me
razorpay.key-secret=replace_me
```

Never commit real secrets to Git.

## Troubleshooting

### Port 8080 is already in use

On macOS or Linux:

```bash
lsof -i :8080
kill <PID>
```

If required:

```bash
kill -9 <PID>
```

### Gateway returns 503

Check:

1. Eureka is running.
2. The required service appears in Eureka.
3. The service name matches the Gateway URI.
4. The service is running on its expected port.
5. `spring-cloud-starter-loadbalancer` is included in the Gateway.

For example:

```text
payment-service → lb://payment-service
```

### Payment endpoint returns 404

The payment controller must expose:

```java
@PostMapping({ "", "/create-order" })
```

### Payment endpoint returns 503

This usually means Gateway cannot find a registered `payment-service` instance. Restart in this order:

```text
Eureka → Payment Service → API Gateway
```

### Organizer account becomes USER

Verify the database role column supports:

```text
USER
ORGANIZER
ADMIN
```

For an existing MySQL enum column:

```sql
ALTER TABLE users
MODIFY COLUMN role ENUM('ADMIN', 'USER', 'ORGANIZER')
NOT NULL
DEFAULT 'USER';
```

To update an existing account:

```sql
UPDATE users
SET role = 'ORGANIZER'
WHERE email = 'organizer@example.com';
```

Log out and log in again so the frontend refreshes the saved role.

## Design decisions

| Area | Decision |
|---|---|
| Service discovery | Eureka |
| API routing | Spring Cloud Gateway |
| Inter-service calls | OpenFeign |
| Database ownership | One database per service |
| Cross-service foreign keys | Not used |
| Frontend gateway URL | `http://localhost:8080/api` |
| Public registration | `USER` or `ORGANIZER` |
| Admin assignment | Backend-controlled |
| Password storage | Plain text only for the current prototype |
| Payment security | Razorpay secret remains backend-only |

For production, replace plain-text passwords with BCrypt, add JWT or session authentication, validate organizer/admin permissions on the backend, verify Razorpay signatures, and use database migrations instead of relying on `ddl-auto=update`.

## Project structure

```text
event-ticket-platform-microservices/
├── eureka-server/
├── api-gateway/
├── user-service/
├── event-service/
├── booking-service/
├── payment-service/
├── react-frontend/
├── angular-frontend/
├── docker-compose.yml
├── setup.ps1
└── README.md
```
