# 📋 Backend API — Development Plan

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Go 1.24 |
| Framework | Gin (HTTP) |
| ORM | GORM |
| Database | PostgreSQL 17 |
| Auth | JWT (Access + Refresh tokens) |
| DI | Google Wire |
| Migrations | golang-migrate |
| Password | bcrypt |

---

## 📁 Project Structure

```
Backend/
├── cmd/server/          → Entry point (main.go)
├── config/              → Env loader
├── internal/
│   ├── bootstrap/       → Wire DI setup
│   ├── handlers/        → HTTP controllers
│   ├── middleware/       → Auth, role guards
│   ├── models/          → DB models + request structs
│   ├── repository/      → DB queries (interface + impl)
│   ├── routes/          → Route registration
│   └── service/         → Business logic (interface + impl)
├── migrations/          → SQL migration files
├── pkg/
│   ├── database/        → DB connection + migration runner
│   └── utils/           → JWT helpers
└── .env                 → Environment config
```

---

## 🗄️ Database Schema

### ✅ Already Migrated (6 tables)

```
users
├── ID (PK)
├── firstName, lastName
├── email (unique), phoneNumber (unique)
├── password (bcrypt hashed)
├── accountName
├── isVerified (bool)
├── role (default: "user")
├── createdAt, updatedAt

userSessions
├── ID (PK)
├── userID (FK → users.ID, CASCADE)
├── refreshToken (unique)
├── deviceID, deviceName, browser, ipAddress
├── isActive (bool)
├── expiresAt, createdAt

reward
├── ID (PK)
├── userID (FK → users.ID, CASCADE, unique)
├── coin (BIGINT, default: 0)

plan
├── ID (PK)
├── planType (varchar)
├── featureJson (JSON)
├── isActive (bool)

payment
├── ID (PK)
├── userID (FK → users.ID)
├── paymentAmount (DECIMAL)
├── status (varchar)
├── planID (FK → plan.ID)
├── createdAt

subscription
├── ID (PK)
├── userID (FK → users.ID)
├── paymentID (FK → payment.ID)
├── startDate, endDate
├── isActive (bool)
├── createdAt
```

---

## 🔐 Authentication Flow

```
Signup → POST /api/auth/signup
Login  → POST /api/auth/login  → sets refresh_token cookie + returns access_token
                                      ↓
                            Access Token (15 min) — sent in Authorization header
                            Refresh Token (7 days) — stored in httpOnly cookie + DB

Token Refresh → POST /api/auth/refresh  → validates cookie → returns new access_token
Logout        → POST /api/auth/logout   → deactivates session in DB, clears cookie
Logout All    → POST /api/auth/logout-all (🔒 protected) → deletes all sessions for user
```

**Device Limit:** Max 3 active sessions per user.

---

## ✅ Existing APIs

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/signup` | Public | Register new user |
| POST | `/login` | Public | Login with email or phone |
| POST | `/refresh` | Public (cookie) | Get new access token |
| POST | `/logout` | Public (cookie) | Logout current session |
| POST | `/logout-all` | 🔒 Bearer | Logout all devices |

---

## 🚀 Planned APIs

---

### 👤 User — `/api/user`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/profile` | 🔒 Bearer | Get current user profile |
| PUT | `/profile` | 🔒 Bearer | Update profile (name, accountName) |
| PUT | `/change-password` | 🔒 Bearer | Change password |
| GET | `/sessions` | 🔒 Bearer | List active sessions/devices |
| DELETE | `/sessions/:id` | 🔒 Bearer | Revoke a specific session |

**New files to create:**
```
internal/models/         → update user.go (add UpdateProfileRequest, ChangePasswordRequest)
internal/repository/     → user_interfaces.go (add GetByID, UpdateProfile)
                         → user_repo.go (implement new methods)
internal/service/        → user_interface.go (add ProfileService methods)
                         → user_service.go (implement)
internal/handlers/       → profile_controller.go
internal/routes/         → routes.go (add user group)
```

---

### 🎁 Reward — `/api/reward`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | 🔒 Bearer | Get my reward/coin balance |
| POST | `/add` | 🔒 Admin | Add coins to a user |
| POST | `/deduct` | 🔒 Admin | Deduct coins from a user |

**New files to create:**
```
internal/models/         → reward.go (Reward model + request structs)
internal/repository/     → reward_interface.go
                         → reward_repo.go
internal/service/        → reward_interface.go
                         → reward_service.go
internal/handlers/       → reward_controller.go
                         → wire.go (add NewRewardHandler)
internal/routes/         → routes.go (add reward group)
migrations/              → 000003 already done ✅
```

---

### 📦 Plan — `/api/plan`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | Public | List all active plans |
| GET | `/:id` | Public | Get plan details |
| POST | `/` | 🔒 Admin | Create a new plan |
| PUT | `/:id` | 🔒 Admin | Update a plan |
| DELETE | `/:id` | 🔒 Admin | Deactivate a plan |

**New files to create:**
```
internal/models/         → plan.go (Plan model, CreatePlanRequest, UpdatePlanRequest)
internal/repository/     → plan_interface.go
                         → plan_repo.go
internal/service/        → plan_interface.go
                         → plan_service.go
internal/handlers/       → plan_controller.go
                         → wire.go (add NewPlanHandler)
internal/routes/         → routes.go (add plan group)
migrations/              → 000004 already done ✅
```

---

### 💳 Payment — `/api/payment`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔒 Bearer | Create a payment record |
| GET | `/` | 🔒 Bearer | Get my payment history |
| GET | `/:id` | 🔒 Bearer | Get specific payment |
| GET | `/all` | 🔒 Admin | List all payments (admin) |

**New files to create:**
```
internal/models/         → payment.go (Payment model, CreatePaymentRequest)
internal/repository/     → payment_interface.go
                         → payment_repo.go
internal/service/        → payment_interface.go
                         → payment_service.go
internal/handlers/       → payment_controller.go
                         → wire.go (add NewPaymentHandler)
internal/routes/         → routes.go (add payment group)
migrations/              → 000005 already done ✅
```

---

### 🔖 Subscription — `/api/subscription`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | 🔒 Bearer | Subscribe to a plan (after payment) |
| GET | `/` | 🔒 Bearer | Get my active subscription |
| DELETE | `/cancel` | 🔒 Bearer | Cancel subscription |
| GET | `/all` | 🔒 Admin | List all subscriptions (admin) |

**New files to create:**
```
internal/models/         → subscription.go (Subscription model, CreateSubscriptionRequest)
internal/repository/     → subscription_interface.go
                         → subscription_repo.go
internal/service/        → subscription_interface.go
                         → subscription_service.go
internal/handlers/       → subscription_controller.go
                         → wire.go (add NewSubscriptionHandler)
internal/routes/         → routes.go (add subscription group)
migrations/              → 000006 already done ✅
```

---

### 🛡️ Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | 🔒 Admin | List all users (paginated) |
| GET | `/users/:id` | 🔒 Admin | Get user by ID |
| PUT | `/users/:id/role` | 🔒 Admin | Update user role |
| DELETE | `/users/:id` | 🔒 Admin | Delete user |
| GET | `/stats` | 🔒 Admin | Dashboard stats (users, revenue, subscriptions) |

**New files to create:**
```
internal/middleware/     → role_middleware.go (AdminOnly guard)
internal/handlers/       → admin_controller.go
internal/routes/         → routes.go (add admin group with AdminOnly middleware)
```

---

## 🔒 Middleware Plan

| Middleware | File | Purpose |
|---|---|---|
| `AuthMiddleware` | `middleware/auth_middleware.go` | ✅ Already done — validates Bearer JWT |
| `AdminMiddleware` | `middleware/role_middleware.go` | ❌ To create — checks `role == "admin"` |
| `RateLimiter` | `middleware/rate_limiter.go` | ❌ Optional — per-IP request limiting |

---

## 🔧 Improvements Needed

| Issue | File | Fix |
|---|---|---|
| JWT secret hardcoded | `pkg/utils/jwt.go` | Read from `JWT_SECRET` env var |
| No input sanitization on login | `handlers/user_controller.go` | Add email/phone format validation |
| No pagination on list APIs | All list handlers | Add `?page=1&limit=10` query params |
| Missing error types | All services | Create `pkg/apierror/errors.go` for typed errors |
| `.env` not in `.gitignore` | `.gitignore` | Ensure `.env` is excluded |

---

## 📋 Implementation Order

```
Phase 1 — Core User APIs
  [x] Auth (signup, login, logout, refresh)
  [ ] User profile & session management

Phase 2 — Business Logic
  [ ] Plan CRUD (admin creates plans)
  [ ] Payment recording
  [ ] Subscription management

Phase 3 — Rewards
  [ ] Reward balance read
  [ ] Admin coin management

Phase 4 — Admin Panel APIs
  [ ] User management
  [ ] Dashboard stats

Phase 5 — Hardening
  [ ] Move JWT secret to env
  [ ] Add role middleware
  [ ] Add pagination
  [ ] Add rate limiting
  [ ] Add request logging middleware
```

---

## 🌐 Final Route Map

```
/api
├── /auth
│   ├── POST /signup
│   ├── POST /login
│   ├── POST /refresh
│   ├── POST /logout
│   └── POST /logout-all        🔒
│
├── /user
│   ├── GET  /profile           🔒
│   ├── PUT  /profile           🔒
│   ├── PUT  /change-password   🔒
│   ├── GET  /sessions          🔒
│   └── DELETE /sessions/:id   🔒
│
├── /plan
│   ├── GET  /                  public
│   ├── GET  /:id               public
│   ├── POST /                  🔒 admin
│   ├── PUT  /:id               🔒 admin
│   └── DELETE /:id             🔒 admin
│
├── /payment
│   ├── POST /                  🔒
│   ├── GET  /                  🔒
│   ├── GET  /:id               🔒
│   └── GET  /all               🔒 admin
│
├── /subscription
│   ├── POST /                  🔒
│   ├── GET  /                  🔒
│   ├── DELETE /cancel          🔒
│   └── GET  /all               🔒 admin
│
├── /reward
│   ├── GET  /                  🔒
│   ├── POST /add               🔒 admin
│   └── POST /deduct            🔒 admin
│
└── /admin
    ├── GET  /users             🔒 admin
    ├── GET  /users/:id         🔒 admin
    ├── PUT  /users/:id/role    🔒 admin
    ├── DELETE /users/:id       🔒 admin
    └── GET  /stats             🔒 admin
```

---

*Generated: 2026-03-07 | Stack: Go + Gin + GORM + PostgreSQL*
