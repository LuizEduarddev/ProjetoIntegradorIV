package service

import "errors"

var (
	ErrInvalidCredentials       = errors.New("invalid credentials")
	ErrUserNotFound             = errors.New("user not found")
	ErrEmailAlreadyExists       = errors.New("email already exists")
	ErrInvalidRole              = errors.New("invalid role")
	ErrTableNotFound            = errors.New("table not found")
	ErrTableNumberAlreadyExists = errors.New("table number already exists")
	ErrInvalidTableStatus       = errors.New("invalid table status")
	ErrProductNotFound          = errors.New("product not found")
	ErrProductUnavailable       = errors.New("product unavailable")
	ErrInvalidProductPrice      = errors.New("invalid product price")
	ErrOrderNotFound            = errors.New("order not found")
	ErrOrderItemNotFound        = errors.New("order item not found")
	ErrInvalidOrderStatus       = errors.New("invalid order status")
	ErrInvalidOrderTransition   = errors.New("invalid order transition")
	ErrInvalidItemStatus        = errors.New("invalid item status")
	ErrInvalidItemTransition    = errors.New("invalid item transition")
	ErrOrderCloseRequiresReady  = errors.New("order can be closed only when all items are ready")
	ErrOrderItemsLocked         = errors.New("order items can only be changed while order is open")
	ErrInvalidInput             = errors.New("invalid input")
)
