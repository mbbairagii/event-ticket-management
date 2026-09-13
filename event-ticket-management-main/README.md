# Event Ticket Management (Microservices Edition)

## Overview
A personal project showcasing a full‑stack event ticketing system built with a **microservices** architecture. Users can browse events, reserve seats, pay via Razorpay, and manage bookings.

## Tech Stack
- **Backend:** Java 17, Spring Boot, Spring Cloud (Eureka, API Gateway, OpenFeign)
- **Frontend:** React, Vite
- **Database:** MySQL
- **Build & Dependency Management:** Maven

## Why Microservices?
- Independent deployment of each domain (users, events, bookings, payments)
- Isolation of failure domains – a problem in one service doesn’t bring down the whole system
- Ability to scale services (e.g., booking service) independently based on load

## Ports Used
| Service | Port |
|---------|------|
| Eureka Server (service registry) | 8761 |
| API Gateway (single entry point) | 8080 |
| User Service | 8081 |
| Event Service | 8082 |
| Booking Service | 8083 |
| Payment Service | 8084 |
| React Frontend | 5173 |

## Features Implemented
- User registration and authentication
- CRUD operations for events
- Atomic seat reservation to prevent overselling
- Payment processing with Razorpay, including tiered refunds
- Rate‑limiting at the gateway to protect against DDoS attacks
- Scheduler that expires unpaid bookings and restores seats
- Simple UI built with React for browsing and booking events
- OAuth 2.0 login with Google (Spring Security OAuth2 client)
