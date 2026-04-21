# Jetrav — Backend

Go REST API for the Jetrav travel agency platform. Built with **Gin**, **PostgreSQL**, **GORM**, **WebSockets**, and **Clean Architecture**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Go 1.24.4 |
| Web Framework | Gin v1.11.0 |
| ORM | GORM v1.31.1 |
| Database | PostgreSQL |
| Migrations | golang-migrate v4.19.1 |
| Auth | JWT (golang-jwt/jwt v5) + Bcrypt |
| Real-time | Gorilla WebSocket v1.5.3 |
| SMS | Twilio |
| Payments | Razorpay |
| DI | Google Wire v0.7.0 |
| Config | godotenv v1.5.1 |

---

## Architecture

Clean Architecture with strict layer separation:

```
Handler (HTTP) → Service (Business Logic) → Repository (Data Access) → PostgreSQL
```

Each layer communicates only through interfaces, enabling testability and dependency inversion.

---

## Project Structure

| Folder | Purpose |
|---|---|
| `cmd/server/` | Entry point — starts server, CORS, WebSocket hub |
| `config/` | Env file loading and database config |
| `internal/app/` | Dependency injection wiring (Google Wire) |
| `internal/handlers/` | HTTP controllers, one per domain |
| `internal/middleware/` | JWT auth and role guards |
| `internal/models/` | GORM entity definitions and request/response types |
| `internal/repository/` | Data access layer — interfaces and PostgreSQL implementations |
| `internal/service/` | Business logic layer |
| `internal/routes/` | All route registration in one place |
| `pkg/database/` | GORM connection singleton and auto-migration runner |
| `pkg/socket/` | WebSocket hub and client lifecycle |
| `pkg/sms/` | Twilio SMS integration |
| `pkg/razorpay/` | Razorpay order creation and payment verification |
| `pkg/utils/` | JWT helpers and HTTP response utilities |
| `migrations/` | SQL migration files (up/down pairs) |

---

## API Routes

**Base URL:** `http://localhost:8080`

| Group | Prefix | Auth | Description |
|---|---|---|---|
| Auth | `/api/auth` | Public / JWT | Signup, OTP, login, token refresh, logout |
| Admin | `/api/admin` | JWT + role=admin | Profile, customers, leads, quotations, dashboard |
| User | `/api/user` | JWT | Profile, dashboard, leads, quotations, plans |
| WebSocket | `/ws` | JWT | Real-time event stream |

Full route definitions are in [`internal/routes/routes.go`](internal/routes/routes.go).

---

## Authentication

### OTP flow

```
POST /api/auth/signup   → User created + OTP sent via SMS
POST /api/auth/send-otp → OTP sent to existing mobile number
POST /api/auth/verify-otp → OTP validated → access token (body) + refresh token (HttpOnly cookie)
```

### Password flow

```
POST /api/auth/login → bcrypt validated → access token (body) + refresh token (HttpOnly cookie)
```

### Tokens

| Token | Algorithm | Expiry | Transport |
|---|---|---|---|
| Access | HS256 JWT | 15 minutes | Response body |
| Refresh | HS256 JWT | 7 days | HttpOnly cookie (`admin_refresh_token` / `user_refresh_token`) |

### Session management

- Maximum **3 active sessions per user** across devices.
- Each session tracks `deviceID`, `deviceName`, `browser`, and `ipAddress`.
- `POST /api/auth/logout` — invalidates the current session.
- `POST /api/auth/logout-all` — invalidates all sessions.

---

## Real-time Events (WebSocket)

Connect once and receive push events without polling.

**Connection:**
```
ws://localhost:8080/ws?token=<accessToken>
```
Or via `Authorization: Bearer <token>` header.

**Message format:**
```json
{ "event": "event_name", "data": {} }
```

**Broadcast scopes:**

| Scope | API | Example |
|---|---|---|
| All admins | `hub.BroadcastToRole("admin", event, data)` | New user signup |
| Specific user | `hub.Emit(userID, event, data)` | Order status update |
| Everyone | `hub.Broadcast(event, data)` | Global announcements |

---

## Database Schema

17 migrations run automatically on server startup.

| # | Migration | Description |
|---|---|---|
| 1 | `create_users_table` | Users (admin & user roles, phone/email unique) |
| 2 | `create_user_sessions` | Multi-device session tracking |
| 3 | `create_reward` | Jetcoins loyalty system |
| 4 | `create_plan` | Subscription plans |
| 5 | `create_payment` | Payment records |
| 6 | `create_subscription` | Active subscriptions |
| 7 | `create_otps_table` | OTP store with 10-min expiry |
| 8 | `create_customers_table` | Customer records (legacy) |
| 9 | `unique_customer_mobile` | Unique constraint on mobile |
| 10 | `create_quotations_table` | Quotations (JSONB details) |
| 11 | `create_leads_table` | Leads with type, status, JSONB details |
| 12 | `alter_plan_table` | Add billingCycle, category, tier |
| 13 | `alter_payment_table` | Add Razorpay fields |
| 14 | `alter_subscription_table` | Add paymentID FK |
| 15 | `seed_plans` | 6 default plans (Silver/Gold/Platinum × individual/corporate) |
| 16 | `merge_customers_into_users` | Merged customers table into users |
| 17 | `add_plantype_to_users` | Add planType column to users |

Migrations auto-run on server start. If a migration is in a dirty state, the runner resets it and retries.

---

## Environment Variables

The env file loaded is selected by the `GO_ENV` shell variable:

| `GO_ENV` | File loaded |
|---|---|
| unset (default) | `.env.local` |
| `local` | `.env.local` |
| `prod` | `.env.prod` |

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env.local   # for local development
cp .env.example .env.prod    # for production
```

**All variables:**

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_SSLMODE=disable          # use "require" in production

# Server
PORT=8080

# JWT  (use a long random string in production)
JWT_SECRET=

# Twilio SMS
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=

# App mode
# development → OTP logged to console + returned in API response (no SMS sent)
# production  → OTP sent via Twilio
APP_ENV=development

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## Getting Started

### Prerequisites

- Go 1.24+
- PostgreSQL (running locally or remote)

### Run

```bash
# Clone and install dependencies
go mod download

# Set up local env
cp .env.example .env.local
# Edit .env.local with your DB credentials, JWT secret, etc.

# Start server (migrations run automatically)
go run ./cmd/server/

# Or explicitly load a specific env
GO_ENV=prod go run ./cmd/server/
```

Server startup sequence:
1. Load env file based on `GO_ENV`
2. Connect to PostgreSQL
3. Run pending migrations (auto)
4. Wire all dependencies
5. Start WebSocket hub
6. Start HTTP server on `PORT`

---

## Creating Migrations

```bash
# Install migrate CLI
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create a new migration
migrate create -ext sql -dir migrations -seq <migration_name>

# Apply manually (server does this automatically on startup)
migrate -path migrations -database "postgres://user:pass@localhost:5432/dbname?sslmode=disable" up

# Roll back one step
migrate -path migrations -database "..." down 1
```

---

## Dependency Injection

Uses [Google Wire](https://github.com/google/wire) for compile-time DI. The generated file `internal/app/wire_gen.go` is manually maintained to allow custom wiring logic.

To regenerate after adding a new provider:

```bash
cd internal/app
wire
```

---

## CORS

Configured in `cmd/server/main.go`. Allowed origins by default:

| Origin | Purpose |
|---|---|
| `http://localhost:3000` | Main frontend |
| `http://localhost:3001` | Admin app |
| `http://localhost:3002` | User app |

Preflight responses are cached for 12 hours.
