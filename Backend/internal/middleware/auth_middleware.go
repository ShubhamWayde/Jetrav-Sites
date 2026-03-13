package middleware

import (
	"net/http"
	"strings"

	"Backend/pkg/utils"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		auth := c.GetHeader("Authorization")

		if auth == "" {
			c.JSON(http.StatusUnauthorized,
				gin.H{"error": "Missing token"})
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(auth, "Bearer ")

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
