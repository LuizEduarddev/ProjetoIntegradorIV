package service

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgconn"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type UserService struct {
	users repository.UserRepository
}

func NewUserService(users repository.UserRepository) *UserService {
	return &UserService{users: users}
}

func (s *UserService) List(ctx context.Context) ([]model.User, error) {
	return s.users.ListActive(ctx)
}

func (s *UserService) Create(ctx context.Context, name, email, password string, role model.Role) (*model.User, error) {
	if name == "" || email == "" || password == "" {
		return nil, ErrInvalidInput
	}
	if !isValidRole(role) {
		return nil, ErrInvalidRole
	}

	user, err := s.users.Create(ctx, repository.CreateUserParams{
		Name:     name,
		Email:    email,
		Password: password,
		Role:     role,
	})
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrEmailAlreadyExists
		}
		return nil, err
	}
	return user, nil
}

func (s *UserService) Update(ctx context.Context, id uuid.UUID, name, email string, role model.Role) (*model.User, error) {
	if name == "" || email == "" {
		return nil, ErrInvalidInput
	}
	if !isValidRole(role) {
		return nil, ErrInvalidRole
	}

	user, err := s.users.Update(ctx, id, repository.UpdateUserParams{
		Name:  name,
		Email: email,
		Role:  role,
	})
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrUserNotFound
		}
		if isUniqueViolation(err) {
			return nil, ErrEmailAlreadyExists
		}
		return nil, err
	}
	return user, nil
}

func (s *UserService) Deactivate(ctx context.Context, id uuid.UUID) error {
	if err := s.users.Deactivate(ctx, id); err != nil {
		if repository.IsNotFound(err) {
			return ErrUserNotFound
		}
		return err
	}
	return nil
}

func isValidRole(role model.Role) bool {
	switch role {
	case model.RoleAdmin, model.RoleWaiter, model.RoleKitchen:
		return true
	default:
		return false
	}
}

func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}
