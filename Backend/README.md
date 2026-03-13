# Jetrav Admin — Backend

Go REST API for the Jetrav travel agency admin platform. Built with **Gin**, **PostgreSQL**, **GORM**, and **Clean Architecture**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Go 1.24.4 |
| Web Framework | Gin v1.11.0 |
| ORM | GORM v1.31.1 |
| Database | PostgreSQL |
| Migrations | golang-migrate v4 |
| Auth | JWT (golang-jwt/jwt v5) + Bcrypt |
| SMS | Twilio |
| DI | Google Wire v0.7.0 |
| Config | godotenv |

---

## Architecture

Clean Architecture with strict layer separation:

```
Handler (HTTP) → Service (Business Logic) → Repository (Data Access) → Database
```

Each layer communicates only through interfaces, enabling testability and dependency inversion.

---

## Project Structure

```
Backend/
├── cmd/
│   └── server/
│       └── main.go                  # Entry point, CORS setup, server start
│
├── config/
│   ├── config.go                    # Environment variable loader (godotenv)
│   └── database.go                  # Database config struct
│
├── internal/
│   ├── bootstrap/
│   │   ├── app.go                   # App initialization
│   │   ├── wire.go                  # Dependency injection wiring
│   │   └── wire_gen.go              # Wire-generated DI code
│   │
│   ├── handlers/                    # HTTP controllers
│   │   ├── admin_controller.go      # Admin auth, profile, password
│   │   ├── customer_controller.go   # Customer CRUD
│   │   ├── lead_controller.go       # Lead CRUD
│   │   ├── quotation_controller.go  # Quotation CRUD
│   │   ├── user_controller.go       # User auth
│   │   └── wire.go                  # Handler DI providers
│   │
│   ├── middleware/
│   │   ├── auth_middleware.go       # JWT token validation
│   │   └── role_middleware.go       # Role-based access control (admin)
│   │
│   ├── models/                      # GORM entity definitions
│   │   ├── admin.go
│   │   ├── customer.go
│   │   ├── lead.go
│   │   ├── otp.go
│   │   ├── quotation.go
│   │   ├── user.go
│   │   └── userSession.go
│   │
│   ├── repository/                  # Data access layer
│   │   ├── customer_interface.go
│   │   ├── customer_repo.go
│   │   ├── lead_interface.go
│   │   ├── lead_repo.go
│   │   ├── otp_interface.go
│   │   ├── otp_repo.go
│   │   ├── quotation_interface.go
│   │   ├── quotation_repo.go
│   │   ├── session_interface.go
│   │   ├── session_repo.go
│   │   ├── user_interfaces.go
│   │   ├── user_repo.go
│   │   └── wire.go
│   │
│   ├── service/                     # Business logic layer
│   │   ├── admin_interface.go
│   │   ├── admin_service.go
│   │   ├── customer_interface.go
│   │   ├── customer_service.go
│   │   ├── lead_interface.go
│   │   ├── lead_service.go
│   │   ├── otp_interface.go
│   │   ├── otp_service.go
│   │   ├── quotation_interface.go
│   │   ├── quotation_service.go
│   │   ├── session_interface.go
│   │   ├── session_service.go
│   │   ├── user_interface.go
│   │   ├── user_service.go
│   │   └── wire.go
│   │
│   └── routes/
│       └── routes.go                # API route registration
│
├── pkg/
│   ├── database/
│   │   ├── postgres.go              # GORM PostgreSQL connection
│   │   └── migrate.go               # Migration runner
│   ├── sms/
│   │   └── sms.go                   # Twilio SMS integration
│   └── utils/
│       ├── jwt.go                   # JWT generation & validation
│       └── response.go              # Standard API response helpers
│
├── migrations/                      # SQL migration files (up/down)
│   ├── 000001_create_users_table
│   ├── 000002_create_user_sessions
│   ├── 000003_create_reward
│   ├── 000004_create_plan
│   ├── 000005_create_payment
│   ├── 000006_create_subscription
│   ├── 000007_create_otps_table
│   ├── 000008_create_customers_table
│   ├── 000009_unique_customer_mobile
│   ├── 000010_create_quotations_table
│   └── 000011_create_leads_table
│
├── docker/
│   └── Dockerfile                   # Application container image
├── docker-compose.yml               # Multi-container setup (app + PostgreSQL)
├── .env.example                     # Environment variable template
├── go.mod
└── go.sum
```

---

## API Routes

**Base URL:** `http://localhost:8080`

### User Auth

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout current session |
| POST | `/api/auth/logout-all` | Logout all devices (protected) |

### Admin Auth & Profile

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/auth/signup` | Admin registration (OTP flow) |
| POST | `/api/admin/auth/send-otp` | Send OTP to mobile number |
| POST | `/api/admin/auth/verify-otp` | Verify OTP |
| POST | `/api/admin/auth/login` | Admin password login |
| POST | `/api/admin/auth/refresh` | Refresh admin token |
| POST | `/api/admin/auth/logout` | Admin logout |
| POST | `/api/admin/auth/logout-all` | Logout all sessions (protected) |
| GET | `/api/admin/profile` | Get admin profile (protected) |
| PUT | `/api/admin/profile` | Update admin profile (protected) |
| POST | `/api/admin/profile/set-password` | Set/change password (protected) |

### Customers (all protected)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/customers` | Create customer |
| GET | `/api/admin/customers` | List all customers |
| GET | `/api/admin/customers/:id` | Get customer by ID |
| PUT | `/api/admin/customers/:id` | Update customer |
| DELETE | `/api/admin/customers/:id` | Delete customer |

### Quotations (all protected, nested under customer)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/customers/:id/quotations` | Create quotation |
| GET | `/api/admin/customers/:id/quotations` | List customer quotations |
| DELETE | `/api/admin/customers/:id/quotations/:quotationId` | Delete quotation |

### Leads (all protected)

| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/leads` | Create lead |
| GET | `/api/admin/leads` | List all leads |
| GET | `/api/admin/leads/:id` | Get lead by ID |
| PUT | `/api/admin/leads/:id` | Update lead |
| DELETE | `/api/admin/leads/:id` | Delete lead |

---

## Database Schema

PostgreSQL with 11 migrations:

| # | Table | Purpose |
|---|---|---|
| 1 | `users` | User accounts |
| 2 | `user_sessions` | Multi-device session management |
| 3 | `rewards` | Reward system |
| 4 | `plans` | Travel plans |
| 5 | `payments` | Payment records |
| 6 | `subscriptions` | Subscription data |
| 7 | `otps` | SMS one-time passwords |
| 8 | `customers` | Customer records |
| 9 | — | Unique constraint on customer mobile |
| 10 | `quotations` | Travel quotations (per customer) |
| 11 | `leads` | Sales leads |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSLMODE=disable

# Server
PORT=8080

# JWT
JWT_SECRET=

# Twilio SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# development = logs OTP to console (no SMS sent)
# production  = sends SMS via Twilio
APP_ENV=development
```

---

## Getting Started

### Prerequisites

- Go 1.24+
- PostgreSQL
- [golang-migrate CLI](https://github.com/golang-migrate/migrate)

### Run locally

```bash
# Install dependencies
go mod download

# Copy and fill env
cp .env.example .env

# Run database migrations
migrate -path migrations -database "postgres://user:pass@localhost:5432/dbname?sslmode=disable" up

# Start server
go run ./cmd/server/main.go
```

### Run with Docker

```bash
docker-compose up --build
```

---

## Migrations

```bash
# Create a new migration
migrate create -ext sql -dir migrations -seq <migration_name>

# Apply all pending migrations
migrate -path migrations -database "<DB_URL>" up

# Roll back last migration
migrate -path migrations -database "<DB_URL>" down 1

# Check current version
migrate -path migrations -database "<DB_URL>" version
```

---

## Dependency Injection

This project uses [Google Wire](https://github.com/google/wire) for compile-time dependency injection.

```bash
# Regenerate wire_gen.go after changing providers
cd internal/bootstrap
wire
```
