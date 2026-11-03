package middleware

import (
	"net/http"

	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

// AdminOnly allows access only to users with role == "admin".
// Must be used after AuthMiddleware (which sets the "role" context value).
func AdminOnly() gin.HandlerFunc {
	return RequireRole("admin")
}

// UserOnly allows access only to customers (role == "user"), so an admin token
// held by the user app can't act as a customer.
func UserOnly() gin.HandlerFunc {
	return RequireRole("user")
}

// RequireRole allows access only to the given role. Must run after AuthMiddleware.
func RequireRole(want string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			utils.Error(c, http.StatusForbidden, "Access denied: role not found")
			c.Abort()
			return
		}

		if role != want {
			utils.Error(c, http.StatusForbidden, "Access denied: "+want+" privileges required")
			c.Abort()
			return
		}

		c.Next()
	}
}
