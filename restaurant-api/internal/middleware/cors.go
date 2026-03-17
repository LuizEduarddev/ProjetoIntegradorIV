package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func CORSAllowAll() gin.HandlerFunc {
	return func(c *gin.Context) {
		headers := c.Writer.Header()
		headers.Set("Access-Control-Allow-Origin", "*")
		headers.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization, X-Requested-With")
		headers.Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		headers.Set("Access-Control-Expose-Headers", "Content-Length, Content-Type, Authorization")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
