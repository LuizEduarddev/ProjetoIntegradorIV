package handler

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"restaurant-api/internal/service"
)

func writeServiceError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrInvalidInput),
		errors.Is(err, service.ErrInvalidRole),
		errors.Is(err, service.ErrInvalidTableStatus),
		errors.Is(err, service.ErrInvalidProductPrice),
		errors.Is(err, service.ErrInvalidOrderStatus),
		errors.Is(err, service.ErrInvalidItemStatus):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case errors.Is(err, service.ErrInvalidCredentials):
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
	case errors.Is(err, service.ErrUserNotFound),
		errors.Is(err, service.ErrTableNotFound),
		errors.Is(err, service.ErrProductNotFound),
		errors.Is(err, service.ErrOrderNotFound),
		errors.Is(err, service.ErrOrderItemNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
	case errors.Is(err, service.ErrEmailAlreadyExists),
		errors.Is(err, service.ErrTableNumberAlreadyExists),
		errors.Is(err, service.ErrInvalidOrderTransition),
		errors.Is(err, service.ErrInvalidItemTransition),
		errors.Is(err, service.ErrOrderCloseRequiresReady),
		errors.Is(err, service.ErrOrderItemsLocked),
		errors.Is(err, service.ErrProductUnavailable):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
	}
}
