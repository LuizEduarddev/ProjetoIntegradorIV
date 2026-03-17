package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/service"
)

type UserHandler struct {
	users *service.UserService
}

func NewUserHandler(users *service.UserService) *UserHandler {
	return &UserHandler{users: users}
}

type createUserRequest struct {
	Name     string     `json:"name" binding:"required"`
	Email    string     `json:"email" binding:"required"`
	Password string     `json:"password" binding:"required"`
	Role     model.Role `json:"role" binding:"required"`
}

type updateUserRequest struct {
	Name  string     `json:"name" binding:"required"`
	Email string     `json:"email" binding:"required"`
	Role  model.Role `json:"role" binding:"required"`
}

func (h *UserHandler) List(c *gin.Context) {
	users, err := h.users.List(c.Request.Context())
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *UserHandler) Create(c *gin.Context) {
	var req createUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	user, err := h.users.Create(c.Request.Context(), req.Name, req.Email, req.Password, req.Role)
	if err != nil {
		log.Println("failed during try to create user: %w", err)
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, user)
}

func (h *UserHandler) Update(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	user, err := h.users.Update(c.Request.Context(), userID, req.Name, req.Email, req.Role)
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (h *UserHandler) Deactivate(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}
	if err := h.users.Deactivate(c.Request.Context(), userID); err != nil {
		writeServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
