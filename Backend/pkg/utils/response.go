package utils

import "github.com/gin-gonic/gin"

// ─── Standard API Response Helpers ───────────────────────────────────────────

// Success sends a 2xx JSON response with optional data payload.
func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	payload := gin.H{
		"success": true,
		"message": message,
	}
	if data != nil {
		payload["data"] = data
	}
	c.JSON(statusCode, payload)
}

// Error sends an error JSON response.
func Error(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, gin.H{
		"success": false,
		"message": message,
	})
}
