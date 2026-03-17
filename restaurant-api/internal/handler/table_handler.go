package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/service"
)

type TableHandler struct {
	tables *service.TableService
}

func NewTableHandler(tables *service.TableService) *TableHandler {
	return &TableHandler{tables: tables}
}

type createTableRequest struct {
	Number int `json:"number" binding:"required,min=1"`
}

type updateTableStatusRequest struct {
	Status model.TableStatus `json:"status" binding:"required"`
}

func (h *TableHandler) List(c *gin.Context) {
	tables, err := h.tables.List(c.Request.Context())
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, tables)
}

func (h *TableHandler) Create(c *gin.Context) {
	var req createTableRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	table, err := h.tables.Create(c.Request.Context(), req.Number)
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, table)
}

func (h *TableHandler) UpdateStatus(c *gin.Context) {
	tableID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid table id"})
		return
	}

	var req updateTableStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	table, err := h.tables.UpdateStatus(c.Request.Context(), tableID, req.Status)
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, table)
}
