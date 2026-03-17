package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"restaurant-api/internal/repository"
	"restaurant-api/internal/service"
)

type ProductHandler struct {
	products *service.ProductService
}

func NewProductHandler(products *service.ProductService) *ProductHandler {
	return &ProductHandler{products: products}
}

type createProductRequest struct {
	Name        string  `json:"name" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required"`
	Category    string  `json:"category"`
	Available   *bool   `json:"available"`
}

type updateProductRequest struct {
	Name        *string  `json:"name"`
	Description *string  `json:"description"`
	Price       *float64 `json:"price"`
	Category    *string  `json:"category"`
	Available   *bool    `json:"available"`
}

func (h *ProductHandler) List(c *gin.Context) {
	products, err := h.products.List(c.Request.Context())
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, products)
}

func (h *ProductHandler) Create(c *gin.Context) {
	var req createProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	available := true
	if req.Available != nil {
		available = *req.Available
	}

	product, err := h.products.Create(c.Request.Context(), repository.CreateProductParams{
		Name:        req.Name,
		Description: req.Description,
		Price:       req.Price,
		Category:    req.Category,
		Available:   available,
	})
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusCreated, product)
}

func (h *ProductHandler) Update(c *gin.Context) {
	productID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	var req updateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	current, err := h.products.GetByID(c.Request.Context(), productID)
	if err != nil {
		writeServiceError(c, err)
		return
	}

	params := repository.UpdateProductParams{
		Name:        current.Name,
		Description: current.Description,
		Price:       current.Price,
		Category:    current.Category,
		Available:   current.Available,
	}

	if req.Name != nil {
		params.Name = *req.Name
	}
	if req.Description != nil {
		params.Description = *req.Description
	}
	if req.Price != nil {
		params.Price = *req.Price
	}
	if req.Category != nil {
		params.Category = *req.Category
	}
	if req.Available != nil {
		params.Available = *req.Available
	}

	product, err := h.products.Update(c.Request.Context(), productID, params)
	if err != nil {
		writeServiceError(c, err)
		return
	}
	c.JSON(http.StatusOK, product)
}

func (h *ProductHandler) Delete(c *gin.Context) {
	productID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid product id"})
		return
	}

	if err := h.products.Delete(c.Request.Context(), productID); err != nil {
		writeServiceError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
