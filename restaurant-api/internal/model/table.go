package model

import (
	"time"

	"github.com/google/uuid"
)

type TableStatus string

const (
	TableFree     TableStatus = "free"
	TableOccupied TableStatus = "occupied"
	TableWaiting  TableStatus = "waiting"
	TableClosed   TableStatus = "closed"
)

type Table struct {
	ID        uuid.UUID   `db:"id" json:"id"`
	Number    int         `db:"number" json:"number"`
	Status    TableStatus `db:"status" json:"status"`
	Active    bool        `db:"active" json:"active"`
	CreatedAt time.Time   `db:"created_at" json:"created_at"`
	UpdatedAt time.Time   `db:"updated_at" json:"updated_at"`
}
