package service

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type authUserRepoStub struct {
	user *model.User
	err  error
}

func (s *authUserRepoStub) GetByEmail(_ context.Context, _ string) (*model.User, error) {
	if s.err != nil {
		return nil, s.err
	}
	return s.user, nil
}

func (s *authUserRepoStub) GetByID(context.Context, uuid.UUID) (*model.User, error) {
	return nil, pgx.ErrNoRows
}

func (s *authUserRepoStub) ListActive(context.Context) ([]model.User, error) {
	return nil, nil
}

func (s *authUserRepoStub) Create(context.Context, repository.CreateUserParams) (*model.User, error) {
	return nil, nil
}

func (s *authUserRepoStub) Update(context.Context, uuid.UUID, repository.UpdateUserParams) (*model.User, error) {
	return nil, nil
}

func (s *authUserRepoStub) Deactivate(context.Context, uuid.UUID) error {
	return nil
}

func TestAuthServiceLoginSuccess(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("secret123"), 12)
	require.NoError(t, err)

	repo := &authUserRepoStub{
		user: &model.User{
			ID:       uuid.New(),
			Email:    "waiter@example.com",
			Password: string(hash),
			Role:     model.RoleWaiter,
		},
	}

	svc := NewAuthService(repo, "jwt-secret", time.Hour)
	token, user, err := svc.Login(context.Background(), "waiter@example.com", "secret123")
	require.NoError(t, err)
	require.NotNil(t, user)
	assert.NotEmpty(t, token)
	assert.Equal(t, model.RoleWaiter, user.Role)
}

func TestAuthServiceLoginInvalidPassword(t *testing.T) {
	hash, err := bcrypt.GenerateFromPassword([]byte("secret123"), 12)
	require.NoError(t, err)

	repo := &authUserRepoStub{
		user: &model.User{
			ID:       uuid.New(),
			Email:    "waiter@example.com",
			Password: string(hash),
			Role:     model.RoleWaiter,
		},
	}

	svc := NewAuthService(repo, "jwt-secret", time.Hour)
	_, _, err = svc.Login(context.Background(), "waiter@example.com", "wrong-pass")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrInvalidCredentials)
}
