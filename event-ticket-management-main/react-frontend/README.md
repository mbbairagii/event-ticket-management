# Event Ticket Management

A simple ticketing platform with Spring Boot micro‑services and a React front‑end.

## Tech Stack
- **Backend**: Java 21, Spring Boot 3, Maven, Eureka, JWT, Razorpay SDK
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Docker)

## Services & Ports
| Service | Port |
|---|---|
| Eureka Server | 8761 |
| API Gateway | 8080 |
| User Service | 8081 |
| Event Service | 8082 |
| Booking Service | 8083 |
| Payment Service | 8084 |
| React UI | 5173 |

## How to Run
1. Install Java 21, Docker, Node 20.
2. Start PostgreSQL: `docker compose up -d db`.
3. Launch services in order:
   ```bash
   ./mvnw spring-boot:run -pl eureka-server
   ./mvnw spring-boot:run -pl api-gateway
   ./mvnw spring-boot:run -pl user-service
   ./mvnw spring-boot:run -pl event-service
   ./mvnw spring-boot:run -pl booking-service
   ./mvw spring-boot:run -pl payment-service
   ```
4. Run the UI:
   ```bash
   cd react-frontend
   npm install
   npm run dev
   ```
5. Open http://localhost:5173.

## Tests
Run `mvn test` – all modules report **43 passing**.

## License
MIT
