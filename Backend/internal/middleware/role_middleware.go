package middleware

import (
	"net/http"

	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

// AdminOnly allows access only to users with role == "admin".
// Must be used after AuthMiddleware (which sets the "role" context value).
func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			utils.Error(c, http.StatusForbidden, "Access denied: role not found")
			c.Abort()
			return
		}

		if role != "admin" {
			utils.Error(c, http.StatusForbidden, "Access denied: admin privileges required")
			c.Abort()
			return
		}

		c.Next()
	}
}
