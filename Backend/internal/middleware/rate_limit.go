package middleware

import (
	"net/http"
	"sync"
	"time"

	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

// RateLimit allows at most `limit` requests per client IP in each fixed `window`.
// In-memory, so limits are per server instance — enough to stop brute force and
// SMS-cost abuse on the public auth endpoints of a single-instance deployment.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	type bucket struct {
		count   int
		resetAt time.Time
	}

	var (
		mu      sync.Mutex
		buckets = map[string]*bucket{}
	)

	// Drop expired buckets so the map can't grow without bound
	go func() {
		for range time.Tick(window) {
			now := time.Now()
			mu.Lock()
			for ip, b := range buckets {
				if now.After(b.resetAt) {
					delete(buckets, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		mu.Lock()
		b, ok := buckets[ip]
		if !ok || now.After(b.resetAt) {
			b = &bucket{resetAt: now.Add(window)}
			buckets[ip] = b
		}
		b.count++
		exceeded := b.count > limit
		mu.Unlock()

		if exceeded {
			utils.Error(c, http.StatusTooManyRequests, "Too many requests — please try again later")
			c.Abort()
			return
		}
		c.Next()
	}
}
