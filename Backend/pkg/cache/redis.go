package cache

import (
	"context"
	"log"
	"sync"
	"time"

	"Backend/config"
	"github.com/redis/go-redis/v9"
)

var (
	client    *redis.Client
	available bool
	once      sync.Once
	ctx       = context.Background()
)

// Connect initialises the Redis client once using REDIS_URL from env.
// Falls back to localhost:6379 with no password and DB 0.
// Non-fatal: if Redis is unreachable the server continues without it.
func Connect() {
	once.Do(func() {
		addr := config.GetEnv("REDIS_URL")
		if addr == "" {
			addr = "localhost:6379"
		}

		opts, err := redis.ParseURL(addr)
		if err != nil {
			opts = &redis.Options{
				Addr:     addr,
				Password: config.GetEnv("REDIS_PASSWORD"),
				DB:       0,
			}
		}

		// Short timeouts so the probe fails fast without noisy retry logs.
		opts.DialTimeout  = 2 * time.Second
		opts.ReadTimeout  = 2 * time.Second
		opts.WriteTimeout = 2 * time.Second
		opts.MaxRetries   = 0 // no retries during startup probe

		c := redis.NewClient(opts)
		pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
		defer cancel()
		if _, err := c.Ping(pingCtx).Result(); err != nil {
			log.Printf("⚠️  Redis unavailable (%v) — falling back to DB-backed OTP store", err)
			return
		}

		client = c
		available = true
		log.Println("✅ Redis connected")
	})
}

// IsAvailable reports whether the Redis client connected successfully.
func IsAvailable() bool { return available }

// Client returns the singleton Redis client (must call Connect first).
func Client() *redis.Client {
	return client
}

// ── Generic helpers ───────────────────────────────────────────────────────────

func Set(key, value string, ttl time.Duration) error {
	return client.Set(ctx, key, value, ttl).Err()
}

func Get(key string) (string, error) {
	return client.Get(ctx, key).Result()
}

func Del(key string) error {
	return client.Del(ctx, key).Err()
}

func Exists(key string) (bool, error) {
	n, err := client.Exists(ctx, key).Result()
	return n > 0, err
}
