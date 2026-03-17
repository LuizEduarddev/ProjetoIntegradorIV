package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/service"
)

type KitchenHandler struct {
	kitchen *service.KitchenService
}

func NewKitchenHandler(kitchen *service.KitchenService) *KitchenHandler {
	return &KitchenHandler{kitchen: kitchen}
}

type updateKitchenItemStatusRequest struct {
	Status model.ItemStatus `json:"status" binding:"required"`
}

func (h *KitchenHandler) ListOrders(c *gin.Context) {
	orders, err := h.kitchen.ListOrders(c.Request.Context())
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, orders)
}

func (h *KitchenHandler) UpdateItemStatus(c *gin.Context) {
	orderID, err := uuid.Parse(c.Param("orderId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid order id"})
		return
	}
	itemID, err := uuid.Parse(c.Param("itemId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid item id"})
		return
	}

	var req updateKitchenItemStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	item, err := h.kitchen.UpdateItemStatus(c.Request.Context(), orderID, itemID, req.Status)
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, item)
}
