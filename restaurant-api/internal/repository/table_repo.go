package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-api/internal/model"
)

type TableRepository interface {
	ListActive(ctx context.Context) ([]model.Table, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Table, error)
	Create(ctx context.Context, number int) (*model.Table, error)
	UpdateStatus(ctx context.Context, id uuid.UUID, status model.TableStatus) (*model.Table, error)
	Deactivate(ctx context.Context, id uuid.UUID) error
}

type TablePGRepository struct {
	db *pgxpool.Pool
}

func NewTableRepository(db *pgxpool.Pool) *TablePGRepository {
	return &TablePGRepository{db: db}
}

func (r *TablePGRepository) ListActive(ctx context.Context) ([]model.Table, error) {
	const query = `
		SELECT id, number, status, active, created_at, updated_at
		FROM tables
		WHERE active = TRUE
		ORDER BY number ASC
	`
	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tables := make([]model.Table, 0)
	for rows.Next() {
		var t model.Table
		if err := rows.Scan(&t.ID, &t.Number, &t.Status, &t.Active, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		tables = append(tables, t)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return tables, nil
}

func (r *TablePGRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Table, error) {
	const query = `
		SELECT id, number, status, active, created_at, updated_at
		FROM tables
		WHERE id = $1 AND active = TRUE
	`
	var t model.Table
	if err := r.db.QueryRow(ctx, query, id).Scan(&t.ID, &t.Number, &t.Status, &t.Active, &t.CreatedAt, &t.UpdatedAt); err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TablePGRepository) Create(ctx context.Context, number int) (*model.Table, error) {
	const query = `
		INSERT INTO tables (number)
		VALUES ($1)
		RETURNING id, number, status, active, created_at, updated_at
	`
	var t model.Table
	if err := r.db.QueryRow(ctx, query, number).Scan(&t.ID, &t.Number, &t.Status, &t.Active, &t.CreatedAt, &t.UpdatedAt); err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TablePGRepository) UpdateStatus(ctx context.Context, id uuid.UUID, status model.TableStatus) (*model.Table, error) {
	const query = `
		UPDATE tables
		SET status = $2, updated_at = NOW()
		WHERE id = $1 AND active = TRUE
		RETURNING id, number, status, active, created_at, updated_at
	`
	var t model.Table
	if err := r.db.QueryRow(ctx, query, id, status).Scan(
		&t.ID,
		&t.Number,
		&t.Status,
		&t.Active,
		&t.CreatedAt,
		&t.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *TablePGRepository) Deactivate(ctx context.Context, id uuid.UUID) error {
	const query = `
		UPDATE tables
		SET active = FALSE, updated_at = NOW()
		WHERE id = $1 AND active = TRUE
	`
	tag, err := r.db.Exec(ctx, query, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}
