package service

import (
	"context"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"

	"restaurant-api/internal/auth"
	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type AuthService struct {
	users     repository.UserRepository
	jwtSecret string
	jwtTTL    time.Duration
}

func NewAuthService(users repository.UserRepository, jwtSecret string, jwtTTL time.Duration) *AuthService {
	return &AuthService{
		users:     users,
		jwtSecret: jwtSecret,
		jwtTTL:    jwtTTL,
	}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, *model.User, error) {
	user, err := s.users.GetByEmail(ctx, email)
	if err != nil {
		if repository.IsNotFound(err) {
			return "", nil, ErrInvalidCredentials
		}
		return "", nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return "", nil, ErrInvalidCredentials
		}
		return "", nil, err
	}

	token, err := auth.GenerateToken(
		s.jwtSecret,
		s.jwtTTL,
		user.ID.String(),
		user.Email,
		string(user.Role),
	)
	if err != nil {
		return "", nil, err
	}

	return token, user, nil
}
