package repository

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-api/internal/model"
)

type CreateUserParams struct {
	Name     string
	Email    string
	Password string
	Role     model.Role
}

type UpdateUserParams struct {
	Name  string
	Email string
	Role  model.Role
}

type UserRepository interface {
	GetByEmail(ctx context.Context, email string) (*model.User, error)
	GetByID(ctx context.Context, id uuid.UUID) (*model.User, error)
	ListActive(ctx context.Context) ([]model.User, error)
	Create(ctx context.Context, params CreateUserParams) (*model.User, error)
	Update(ctx context.Context, id uuid.UUID, params UpdateUserParams) (*model.User, error)
	Deactivate(ctx context.Context, id uuid.UUID) error
}

type UserPGRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserPGRepository {
	return &UserPGRepository{db: db}
}

func (r *UserPGRepository) GetByEmail(ctx context.Context, email string) (*model.User, error) {
	const query = `
		SELECT id, name, email, password, role, active, created_at, updated_at
		FROM users
		WHERE email = $1 AND active = TRUE
	`
	var user model.User
	if err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserPGRepository) GetByID(ctx context.Context, id uuid.UUID) (*model.User, error) {
	const query = `
		SELECT id, name, email, password, role, active, created_at, updated_at
		FROM users
		WHERE id = $1
	`
	var user model.User
	if err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserPGRepository) ListActive(ctx context.Context) ([]model.User, error) {
	const query = `
		SELECT id, name, email, password, role, active, created_at, updated_at
		FROM users
		WHERE active = TRUE
		ORDER BY created_at DESC
	`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]model.User, 0)
	for rows.Next() {
		var user model.User
		if err := rows.Scan(
			&user.ID,
			&user.Name,
			&user.Email,
			&user.Password,
			&user.Role,
			&user.Active,
			&user.CreatedAt,
			&user.UpdatedAt,
		); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return users, nil
}

func (r *UserPGRepository) Create(ctx context.Context, params CreateUserParams) (*model.User, error) {
	const query = `
		INSERT INTO users (name, email, password, role)
		VALUES ($1, $2, $3, $4)
		RETURNING id, name, email, password, role, active, created_at, updated_at
	`
	var user model.User
	if err := r.db.QueryRow(ctx, query, params.Name, params.Email, params.Password, params.Role).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserPGRepository) Update(ctx context.Context, id uuid.UUID, params UpdateUserParams) (*model.User, error) {
	const query = `
		UPDATE users
		SET name = $2, email = $3, role = $4, updated_at = NOW()
		WHERE id = $1
		RETURNING id, name, email, password, role, active, created_at, updated_at
	`
	var user model.User
	if err := r.db.QueryRow(ctx, query, id, params.Name, params.Email, params.Role).Scan(
		&user.ID,
		&user.Name,
		&user.Email,
		&user.Password,
		&user.Role,
		&user.Active,
		&user.CreatedAt,
		&user.UpdatedAt,
	); err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserPGRepository) Deactivate(ctx context.Context, id uuid.UUID) error {
	const query = `
		UPDATE users
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

func IsNotFound(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}
