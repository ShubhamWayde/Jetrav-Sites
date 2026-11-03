package middleware

import (
	"net/http"
	"strings"

	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		var tokenStr string
		if auth := c.GetHeader("Authorization"); strings.HasPrefix(auth, "Bearer ") {
			tokenStr = strings.TrimPrefix(auth, "Bearer ")
		} else if c.FullPath() == "/ws" {
			// Browsers cannot send headers on a WebSocket upgrade, so only /ws
			// accepts the token as a query param (keeps it out of other URLs/logs).
			tokenStr = c.Query("token")
		}

		if tokenStr == "" {
			utils.Error(c, http.StatusUnauthorized, "Missing token")
			c.Abort()
			return
		}

		// Access tokens only — a refresh token must never authorize API calls.
		claims, err := utils.ValidateAccessToken(tokenStr)
		if err != nil {
			utils.Error(c, http.StatusUnauthorized, "Invalid token")
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}
