# ── Build stage ───────────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Static binary so the runtime image needs no libc
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM alpine:3.20

# CA certs for Twilio/Razorpay HTTPS, tzdata for correct local dates
RUN apk add --no-cache ca-certificates tzdata && adduser -D -H -u 10001 app

WORKDIR /app

COPY --from=build /out/server ./server
# Migrations are read from ./migrations at startup
COPY --from=build /src/migrations ./migrations

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:8080/healthz || exit 1

CMD ["./server"]
