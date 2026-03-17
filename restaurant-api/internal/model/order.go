package model

import (
	"time"

	"github.com/google/uuid"
)

type OrderStatus string

const (
	OrderOpen      OrderStatus = "open"
	OrderSent      OrderStatus = "sent"
	OrderClosed    OrderStatus = "closed"
	OrderCancelled OrderStatus = "cancelled"
)

type Order struct {
	ID          uuid.UUID   `db:"id" json:"id"`
	TableID     uuid.UUID   `db:"table_id" json:"table_id"`
	TableNumber int         `db:"table_number" json:"table_number,omitempty"`
	WaiterID    uuid.UUID   `db:"waiter_id" json:"waiter_id"`
	Status      OrderStatus `db:"status" json:"status"`
	Notes       string      `db:"notes" json:"notes"`
	Items       []OrderItem `db:"-" json:"items,omitempty"`
	CreatedAt   time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time   `db:"updated_at" json:"updated_at"`
}
