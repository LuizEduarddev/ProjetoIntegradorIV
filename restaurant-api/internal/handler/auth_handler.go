package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"restaurant-api/internal/service"
)

type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(auth *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

type loginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type loginResponse struct {
	Token string `json:"token"`
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	token, _, err := h.auth.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	c.JSON(http.StatusOK, loginResponse{Token: token})
}
