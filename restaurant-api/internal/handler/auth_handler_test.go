package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"golang.org/x/crypto/bcrypt"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
	"restaurant-api/internal/service"
)

type authHandlerUserRepoStub struct {
	user *model.User
	err  error
}

func (s *authHandlerUserRepoStub) GetByEmail(context.Context, string) (*model.User, error) {
	if s.err != nil {
		return nil, s.err
	}
	return s.user, nil
}

func (s *authHandlerUserRepoStub) GetByID(context.Context, uuid.UUID) (*model.User, error) {
	return nil, pgx.ErrNoRows
}

func (s *authHandlerUserRepoStub) ListActive(context.Context) ([]model.User, error) {
	return nil, nil
}

func (s *authHandlerUserRepoStub) Create(context.Context, repository.CreateUserParams) (*model.User, error) {
	return nil, nil
}

func (s *authHandlerUserRepoStub) Update(context.Context, uuid.UUID, repository.UpdateUserParams) (*model.User, error) {
	return nil, nil
}

func (s *authHandlerUserRepoStub) Deactivate(context.Context, uuid.UUID) error {
	return nil
}

func TestAuthHandlerLoginSuccess(t *testing.T) {
	gin.SetMode(gin.TestMode)
	hash, err := bcrypt.GenerateFromPassword([]byte("secret123"), 12)
	require.NoError(t, err)

	repo := &authHandlerUserRepoStub{
		user: &model.User{
			ID:       uuid.New(),
			Email:    "admin@example.com",
			Password: string(hash),
			Role:     model.RoleAdmin,
		},
	}
	svc := service.NewAuthService(repo, "jwt-secret", time.Hour)
	handler := NewAuthHandler(svc)

	router := gin.New()
	router.POST("/auth/login", handler.Login)

	body := []byte(`{"email":"admin@example.com","password":"secret123"}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)

	var payload map[string]string
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &payload))
	assert.NotEmpty(t, payload["token"])
}

func TestAuthHandlerLoginValidation(t *testing.T) {
	gin.SetMode(gin.TestMode)
	svc := service.NewAuthService(&authHandlerUserRepoStub{}, "jwt-secret", time.Hour)
	handler := NewAuthHandler(svc)

	router := gin.New()
	router.POST("/auth/login", handler.Login)

	req := httptest.NewRequest(http.MethodPost, "/auth/login", bytes.NewReader([]byte(`{"email":"not-an-email"}`)))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusBadRequest, rr.Code)
}
