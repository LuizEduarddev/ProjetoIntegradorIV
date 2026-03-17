package auth

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGenerateAndValidateToken(t *testing.T) {
	token, err := GenerateToken("secret", time.Hour, "user-id", "user@example.com", "waiter")
	require.NoError(t, err)
	require.NotEmpty(t, token)

	claims, err := ValidateToken(token, "secret")
	require.NoError(t, err)
	assert.Equal(t, "user-id", claims.UserID)
	assert.Equal(t, "user@example.com", claims.Email)
	assert.Equal(t, "waiter", claims.Role)
}

func TestValidateToken_InvalidSecret(t *testing.T) {
	token, err := GenerateToken("secret", time.Hour, "user-id", "user@example.com", "waiter")
	require.NoError(t, err)

	_, err = ValidateToken(token, "wrong")
	require.Error(t, err)
}
