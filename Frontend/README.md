# Jetrav Admin — Frontend

Turborepo monorepo containing three Next.js applications for the Jetrav travel agency platform.

---

## Tech Stack

| Tool            | Version                     |
| --------------- | --------------------------- |
| Package Manager | pnpm 9.0.0                  |
| Monorepo        | Turborepo 2.8.7             |
| Framework       | Next.js 16.1.6 (App Router) |
| Runtime         | React 19.2.0                |
| Language        | TypeScript 5.9.3            |
| Linting         | ESLint                      |
| Formatting      | Prettier                    |

---

## Monorepo Structure

```
Frontend/
├── apps/
│   ├── admin/         # Admin dashboard (port 3001)
│   ├── marketing/     # Marketing site (port 3001)
│   └── user/          # User portal (port 3000)
│
├── packages/
│   ├── ui/                  # Shared React component library (@repo/ui)
│   ├── eslint-config/       # Shared ESLint config (@repo/eslint-config)
│   └── typescript-config/   # Shared TypeScript configs (@repo/typescript-config)
│
├── styles/
│   └── css/
│       ├── base.css         # Base styles
│       └── variable.css     # CSS variables
│
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # PNPM workspace definition
└── package.json             # Root scripts
```

---

## Apps

### Admin (`apps/admin/`) — Port 3001

Admin dashboard for managing customers, leads, and quotations.

```
admin/
├── app/
│   ├── (auth)/                      # Public auth routes (unauthenticated)
│   │   ├── signin/
│   │   │   └── page.tsx             # Admin sign in
│   │   ├── signup/
│   │   │   └── page.tsx             # Admin sign up (OTP flow)
│   │   └── otp/
│   │       └── page.tsx             # OTP verification
│   │
│   ├── (pages)/                     # Protected routes (JWT required)
│   │   ├── dashboard/
│   │   │   └── page.tsx             # Main dashboard
│   │   ├── customers/
│   │   │   └── page.tsx             # Customers list & management
│   │   ├── leads/
│   │   │   └── page.tsx             # Leads list & management
│   │   ├── quotations/
│   │   │   └── [customerId]/
│   │   │       └── page.tsx         # Quotations for a specific customer
│   │   ├── profile/
│   │   │   └── page.tsx             # Admin profile & password
│   │   └── layout.tsx               # Shared layout (sidebar + header)
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── auth.ts
│   │   ├── customer.ts
│   │   ├── lead.ts
│   │   ├── profile.ts
│   │   └── quotation.ts
│   │
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Root redirect
│   ├── providers.tsx                # Context providers (auth, toast)
│   ├── middleware.ts                # Route protection (redirects unauthenticated)
│   └── globals.css
│
├── components/
│   ├── auth/
│   │   ├── auth-card/
│   │   │   └── AuthCard.tsx         # Reusable auth form wrapper
│   │   └── otp-input/
│   │       └── OTPInput.tsx         # OTP digit input
│   │
│   ├── layout/
│   │   ├── app-layout/
│   │   │   └── AppShell.tsx         # Main app layout wrapper
│   │   ├── header/
│   │   │   └── Header.tsx           # Top header bar
│   │   └── sidebar/
│   │       └── Sidebar.tsx          # Navigation sidebar
│   │
│   ├── modals/
│   │   ├── confirm-delete/
│   │   │   └── ConfirmDeleteModal.tsx
│   │   ├── create-customer/
│   │   │   └── CustomerModal.tsx    # Create / edit customer
│   │   ├── create-lead/
│   │   │   └── AddLeadModal.tsx
│   │   ├── create-quotation/
│   │   │   └── AddQuotationModal.tsx
│   │   └── edit-lead/
│   │       └── EditLeadModal.tsx
│   │
│   └── ui/
│       ├── button/
│       │   └── Button.tsx
│       ├── input-field/
│       │   └── InputField.tsx
│       ├── form-error/
│       │   └── FormError.tsx
│       ├── icons-library/
│       │   └── Icons.tsx            # SVG icon collection
│       └── spinner-loader/
│           └── Spinner.tsx
│
├── context/
│   └── AuthContext.tsx              # Global auth state (user, token, logout)
│
├── lib/
│   ├── api.ts                       # Typed fetch wrapper with auto token refresh
│   ├── auth.ts                      # Token helpers, device ID utilities
│   └── constants.ts                 # API base URL and endpoint constants
│
├── utility/
│   └── date.tsx                     # Date formatting utilities
│
├── middleware.ts                    # Next.js middleware for auth route guards
├── next.config.js
└── tsconfig.json
```

**Features:**

- OTP-based admin signup via SMS (Twilio)
- Password login with JWT authentication
- Auto token refresh on API calls
- Protected routes via Next.js middleware
- Customer CRUD with modal dialogs
- Lead CRUD with modal dialogs
- Quotation management per customer (dynamic route)
- Admin profile view and password management
- Toast notifications (react-toastify)

---

### Marketing (`apps/marketing/`) — Port 3001

Public-facing marketing website.

```
marketing/
├── app/
│   ├── (pages)/
│   │   ├── home/
│   │   │   └── page.tsx             # Home / landing page
│   │   └── layout.tsx               # Pages layout
│   ├── components/
│   │   ├── header/
│   │   │   └── header.tsx
│   │   └── footer/
│   │       └── footer.tsx
│   ├── layout.tsx
│   └── page.tsx
└── public/
```

---

### User (`apps/user/`) — Port 3000

User-facing portal.

```
user/
├── app/
│   ├── layout.tsx                   # Root layout
│   ├── page.tsx                     # Home page
│   └── fonts/                       # Custom fonts
└── public/
```

---

## Shared Packages

### `@repo/ui` — Shared Component Library

```
packages/ui/
└── src/
    ├── button.tsx
    ├── card.tsx
    └── code.tsx
```

Used by all apps. Import via `@repo/ui`.

### `@repo/eslint-config`

Shared ESLint rules used across all apps and packages.

### `@repo/typescript-config`

```
packages/typescript-config/
├── base.json          # Base TypeScript config
├── nextjs.json        # Next.js app config
└── react-library.json # React library config
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9.0.0

```bash
npm install -g pnpm@9.0.0
```

### Install dependencies

```bash
cd Frontend
pnpm install
```

### Run all apps in development

```bash
pnpm dev
```

### Run a specific app

```bash
pnpm dev --filter=admin
pnpm dev --filter=marketing
pnpm dev --filter=user
```

---

## Common Commands

```bash
# Development
pnpm dev                         # Start all apps
pnpm dev --filter=admin          # Start only admin app

# Build
pnpm build                       # Build all apps
pnpm build --filter=admin        # Build only admin app

# Type checking
pnpm check-types                 # Type-check all apps

# Linting
pnpm lint                        # Lint all apps

# Formatting
pnpm format                      # Format all files with Prettier
```

---

## Environment Variables

Each app reads its own `.env.local`. For the admin app:

```env
JETRAV_API_URL=http://localhost:8080
```

---

## Dev Ports

| App       | Port |
| --------- | ---- |
| user      | 3000 |
| admin     | 3001 |
| marketing | 3001 |

---

for build icons
pnpm --filter ui run build:icons
