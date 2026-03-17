package model

import (
	"time"

	"github.com/google/uuid"
)

type ItemStatus string

const (
	ItemPending   ItemStatus = "pending"
	ItemPreparing ItemStatus = "preparing"
	ItemReady     ItemStatus = "ready"
)

type OrderItem struct {
	ID          uuid.UUID  `db:"id" json:"id"`
	OrderID     uuid.UUID  `db:"order_id" json:"order_id"`
	ProductID   uuid.UUID  `db:"product_id" json:"product_id"`
	ProductName string     `db:"product_name" json:"product_name,omitempty"`
	Quantity    int        `db:"quantity" json:"quantity"`
	UnitPrice   float64    `db:"unit_price" json:"unit_price"`
	Notes       string     `db:"notes" json:"notes"`
	Status      ItemStatus `db:"status" json:"status"`
	CreatedAt   time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt   time.Time  `db:"updated_at" json:"updated_at"`
}
