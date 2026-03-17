package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-api/internal/model"
)

type CreateOrderParams struct {
	TableID  uuid.UUID
	WaiterID uuid.UUID
	Notes    string
}

type AddOrderItemParams struct {
	OrderID   uuid.UUID
	ProductID uuid.UUID
	Quantity  int
	UnitPrice float64
	Notes     string
}

type UpdateOrderItemParams struct {
	OrderID  uuid.UUID
	ItemID   uuid.UUID
	Quantity int
	Notes    string
}

type OrderRepository interface {
	Create(ctx context.Context, params CreateOrderParams) (*model.Order, error)
	GetByID(ctx context.Context, orderID uuid.UUID) (*model.Order, error)
	ListItems(ctx context.Context, orderID uuid.UUID) ([]model.OrderItem, error)
	AddItem(ctx context.Context, params AddOrderItemParams) (*model.OrderItem, error)
	UpdateItem(ctx context.Context, params UpdateOrderItemParams) (*model.OrderItem, error)
	DeleteItem(ctx context.Context, orderID, itemID uuid.UUID) error
	UpdateStatus(ctx context.Context, orderID uuid.UUID, status model.OrderStatus) error
	GetItemByID(ctx context.Context, orderID, itemID uuid.UUID) (*model.OrderItem, error)
	UpdateItemStatus(ctx context.Context, orderID, itemID uuid.UUID, status model.ItemStatus) error
	ListKitchenOrders(ctx context.Context) ([]model.Order, error)
	CountNonReadyItems(ctx context.Context, orderID uuid.UUID) (int, error)
	HasActiveOrdersByTable(ctx context.Context, tableID uuid.UUID) (bool, error)
}

type OrderPGRepository struct {
	db *pgxpool.Pool
}

func NewOrderRepository(db *pgxpool.Pool) *OrderPGRepository {
	return &OrderPGRepository{db: db}
}

func (r *OrderPGRepository) Create(ctx context.Context, params CreateOrderParams) (*model.Order, error) {
	const query = `
		INSERT INTO orders (table_id, waiter_id, notes)
		VALUES ($1, $2, $3)
		RETURNING id, table_id, waiter_id, status, notes, created_at, updated_at
	`
	var order model.Order
	if err := r.db.QueryRow(ctx, query, params.TableID, params.WaiterID, params.Notes).Scan(
		&order.ID,
		&order.TableID,
		&order.WaiterID,
		&order.Status,
		&order.Notes,
		&order.CreatedAt,
		&order.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderPGRepository) GetByID(ctx context.Context, orderID uuid.UUID) (*model.Order, error) {
	const query = `
		SELECT o.id, o.table_id, t.number, o.waiter_id, o.status, o.notes, o.created_at, o.updated_at
		FROM orders o
		JOIN tables t ON t.id = o.table_id
		WHERE o.id = $1
	`
	var order model.Order
	if err := r.db.QueryRow(ctx, query, orderID).Scan(
		&order.ID,
		&order.TableID,
		&order.TableNumber,
		&order.WaiterID,
		&order.Status,
		&order.Notes,
		&order.CreatedAt,
		&order.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &order, nil
}

func (r *OrderPGRepository) ListItems(ctx context.Context, orderID uuid.UUID) ([]model.OrderItem, error) {
	const query = `
		SELECT oi.id, oi.order_id, oi.product_id, p.name, oi.quantity, oi.unit_price::float8,
		       COALESCE(oi.notes, ''), oi.status, oi.created_at, oi.updated_at
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		WHERE oi.order_id = $1
		ORDER BY oi.created_at ASC
	`
	rows, err := r.db.Query(ctx, query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.OrderItem, 0)
	for rows.Next() {
		var item model.OrderItem
		if err := rows.Scan(
			&item.ID,
			&item.OrderID,
			&item.ProductID,
			&item.ProductName,
			&item.Quantity,
			&item.UnitPrice,
			&item.Notes,
			&item.Status,
			&item.CreatedAt,
			&item.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

func (r *OrderPGRepository) AddItem(ctx context.Context, params AddOrderItemParams) (*model.OrderItem, error) {
	const query = `
		INSERT INTO order_items (order_id, product_id, quantity, unit_price, notes)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, order_id, product_id, quantity, unit_price::float8, COALESCE(notes, ''), status, created_at, updated_at
	`
	var item model.OrderItem
	if err := r.db.QueryRow(
		ctx,
		query,
		params.OrderID,
		params.ProductID,
		params.Quantity,
		params.UnitPrice,
		params.Notes,
	).Scan(
		&item.ID,
		&item.OrderID,
		&item.ProductID,
		&item.Quantity,
		&item.UnitPrice,
		&item.Notes,
		&item.Status,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *OrderPGRepository) UpdateItem(ctx context.Context, params UpdateOrderItemParams) (*model.OrderItem, error) {
	const query = `
		UPDATE order_items
		SET quantity = $3, notes = $4, updated_at = NOW()
		WHERE order_id = $1 AND id = $2
		RETURNING id, order_id, product_id, quantity, unit_price::float8, COALESCE(notes, ''), status, created_at, updated_at
	`
	var item model.OrderItem
	if err := r.db.QueryRow(ctx, query, params.OrderID, params.ItemID, params.Quantity, params.Notes).Scan(
		&item.ID,
		&item.OrderID,
		&item.ProductID,
		&item.Quantity,
		&item.UnitPrice,
		&item.Notes,
		&item.Status,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *OrderPGRepository) DeleteItem(ctx context.Context, orderID, itemID uuid.UUID) error {
	const query = `DELETE FROM order_items WHERE order_id = $1 AND id = $2`
	tag, err := r.db.Exec(ctx, query, orderID, itemID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *OrderPGRepository) UpdateStatus(ctx context.Context, orderID uuid.UUID, status model.OrderStatus) error {
	const query = `
		UPDATE orders
		SET status = $2, updated_at = NOW()
		WHERE id = $1
	`
	tag, err := r.db.Exec(ctx, query, orderID, status)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *OrderPGRepository) GetItemByID(ctx context.Context, orderID, itemID uuid.UUID) (*model.OrderItem, error) {
	const query = `
		SELECT id, order_id, product_id, quantity, unit_price::float8, COALESCE(notes, ''), status, created_at, updated_at
		FROM order_items
		WHERE order_id = $1 AND id = $2
	`
	var item model.OrderItem
	if err := r.db.QueryRow(ctx, query, orderID, itemID).Scan(
		&item.ID,
		&item.OrderID,
		&item.ProductID,
		&item.Quantity,
		&item.UnitPrice,
		&item.Notes,
		&item.Status,
		&item.CreatedAt,
		&item.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &item, nil
}

func (r *OrderPGRepository) UpdateItemStatus(ctx context.Context, orderID, itemID uuid.UUID, status model.ItemStatus) error {
	const query = `
		UPDATE order_items
		SET status = $3, updated_at = NOW()
		WHERE order_id = $1 AND id = $2
	`
	tag, err := r.db.Exec(ctx, query, orderID, itemID, status)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *OrderPGRepository) ListKitchenOrders(ctx context.Context) ([]model.Order, error) {
	const query = `
		SELECT o.id, o.table_id, t.number, o.waiter_id, o.status, o.notes, o.created_at, o.updated_at
		FROM orders o
		JOIN tables t ON t.id = o.table_id
		WHERE o.status = 'sent' AND t.active = TRUE
		ORDER BY o.created_at ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]model.Order, 0)
	for rows.Next() {
		var order model.Order
		if err := rows.Scan(
			&order.ID,
			&order.TableID,
			&order.TableNumber,
			&order.WaiterID,
			&order.Status,
			&order.Notes,
			&order.CreatedAt,
			&order.UpdatedAt,
		); err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for i := range orders {
		items, err := r.ListItems(ctx, orders[i].ID)
		if err != nil {
			return nil, err
		}
		orders[i].Items = items
	}

	return orders, nil
}

func (r *OrderPGRepository) CountNonReadyItems(ctx context.Context, orderID uuid.UUID) (int, error) {
	const query = `
		SELECT COUNT(*)
		FROM order_items
		WHERE order_id = $1 AND status <> 'ready'
	`
	var count int
	if err := r.db.QueryRow(ctx, query, orderID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (r *OrderPGRepository) HasActiveOrdersByTable(ctx context.Context, tableID uuid.UUID) (bool, error) {
	const query = `
		SELECT EXISTS (
			SELECT 1
			FROM orders
			WHERE table_id = $1 AND status IN ('open', 'sent')
		)
	`
	var exists bool
	if err := r.db.QueryRow(ctx, query, tableID).Scan(&exists); err != nil {
		return false, err
	}
	return exists, nil
}
