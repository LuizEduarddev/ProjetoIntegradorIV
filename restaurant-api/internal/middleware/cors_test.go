package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestCORSAllowAll_Preflight(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORSAllowAll())
	router.POST("/auth/login", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodOptions, "/auth/login", nil)
	req.Header.Set("Origin", "http://localhost:8081")
	req.Header.Set("Access-Control-Request-Method", "POST")
	rr := httptest.NewRecorder()

	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusNoContent, rr.Code)
	assert.Equal(t, "*", rr.Header().Get("Access-Control-Allow-Origin"))
	assert.Contains(t, rr.Header().Get("Access-Control-Allow-Methods"), "POST")
	assert.Contains(t, rr.Header().Get("Access-Control-Allow-Headers"), "Authorization")
}

func TestCORSAllowAll_NormalRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.Use(CORSAllowAll())
	router.GET("/health", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Equal(t, "*", rr.Header().Get("Access-Control-Allow-Origin"))
}
