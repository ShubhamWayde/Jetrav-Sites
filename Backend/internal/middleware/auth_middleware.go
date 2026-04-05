package middleware

import (
	"net/http"
	"strings"

	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		// Accept token from Authorization header OR ?token= query param
		// (WebSocket upgrades cannot send custom headers in the browser).
		var tokenStr string
		if auth := c.GetHeader("Authorization"); auth != "" {
			tokenStr = strings.TrimPrefix(auth, "Bearer ")
		} else if q := c.Query("token"); q != "" {
			tokenStr = q
		}

		if tokenStr == "" {
			c.JSON(http.StatusUnauthorized,
				gin.H{"error": "Missing token"})
			c.Abort()
			return
		}

		claims, err := utils.ValidateToken(tokenStr)
		if err != nil {
			c.JSON(http.StatusUnauthorized,
				gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)

		c.Next()
	}
}
