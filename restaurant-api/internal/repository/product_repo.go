package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-api/internal/model"
)

type CreateProductParams struct {
	Name        string
	Description string
	Price       float64
	Category    string
	Available   bool
}

type UpdateProductParams struct {
	Name        string
	Description string
	Price       float64
	Category    string
	Available   bool
}

type ProductRepository interface {
	List(ctx context.Context) ([]model.Product, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.Product, error)
	Create(ctx context.Context, params CreateProductParams) (*model.Product, error)
	Update(ctx context.Context, id uuid.UUID, params UpdateProductParams) (*model.Product, error)
	Delete(ctx context.Context, id uuid.UUID) error
}

type ProductPGRepository struct {
	db *pgxpool.Pool
}

func NewProductRepository(db *pgxpool.Pool) *ProductPGRepository {
	return &ProductPGRepository{db: db}
}

func (r *ProductPGRepository) List(ctx context.Context) ([]model.Product, error) {
	const query = `
		SELECT id, name, description, price::float8, category, available, created_at, updated_at
		FROM products
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]model.Product, 0)
	for rows.Next() {
		var p model.Product
		if err := rows.Scan(
			&p.ID,
			&p.Name,
			&p.Description,
			&p.Price,
			&p.Category,
			&p.Available,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

func (r *ProductPGRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.Product, error) {
	const query = `
		SELECT id, name, description, price::float8, category, available, created_at, updated_at
		FROM products
		WHERE id = $1
	`
	var p model.Product
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&p.ID,
		&p.Name,
		&p.Description,
		&p.Price,
		&p.Category,
		&p.Available,
		&p.CreatedAt,
		&p.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductPGRepository) Create(ctx context.Context, params CreateProductParams) (*model.Product, error) {
	const query = `
		INSERT INTO products (name, description, price, category, available)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, name, description, price::float8, category, available, created_at, updated_at
	`
	var p model.Product
	if err := r.db.QueryRow(
		ctx,
		query,
		params.Name,
		params.Description,
		params.Price,
		params.Category,
		params.Available,
	).Scan(
		&p.ID,
		&p.Name,
		&p.Description,
		&p.Price,
		&p.Category,
		&p.Available,
		&p.CreatedAt,
		&p.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductPGRepository) Update(ctx context.Context, id uuid.UUID, params UpdateProductParams) (*model.Product, error) {
	const query = `
		UPDATE products
		SET name = $2, description = $3, price = $4, category = $5, available = $6, updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, description, price::float8, category, available, created_at, updated_at
	`
	var p model.Product
	if err := r.db.QueryRow(
		ctx,
		query,
		id,
		params.Name,
		params.Description,
		params.Price,
		params.Category,
		params.Available,
	).Scan(
		&p.ID,
		&p.Name,
		&p.Description,
		&p.Price,
		&p.Category,
		&p.Available,
		&p.CreatedAt,
		&p.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *ProductPGRepository) Delete(ctx context.Context, id uuid.UUID) error {
	tag, err := r.db.Exec(ctx, `DELETE FROM products WHERE id = $1`, id)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}
