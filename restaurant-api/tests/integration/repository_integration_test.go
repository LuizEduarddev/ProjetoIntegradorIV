//go:build integration

package integration

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"

	"restaurant-api/internal/repository"
)

func TestTableRepositoryCRUD(t *testing.T) {
	testcontainers.SkipIfProviderIsNotHealthy(t)

	ctx := context.Background()
	pgContainer, err := postgres.Run(
		ctx,
		"postgres:15-alpine",
		postgres.WithDatabase("restaurant_test"),
		postgres.WithUsername("postgres"),
		postgres.WithPassword("postgres"),
	)
	require.NoError(t, err)
	defer func() {
		_ = pgContainer.Terminate(ctx)
	}()

	connString, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	pool, err := pgxpool.New(ctx, connString)
	require.NoError(t, err)
	defer pool.Close()

	err = applyMigrationUp(ctx, pool, "001_init_schema.sql")
	require.NoError(t, err)

	tableRepo := repository.NewTableRepository(pool)
	created, err := tableRepo.Create(ctx, 7)
	require.NoError(t, err)
	require.Equal(t, 7, created.Number)

	listed, err := tableRepo.ListActive(ctx)
	require.NoError(t, err)
	require.Len(t, listed, 1)

	updated, err := tableRepo.UpdateStatus(ctx, created.ID, "occupied")
	require.NoError(t, err)
	require.Equal(t, "occupied", string(updated.Status))
}

func applyMigrationUp(ctx context.Context, pool *pgxpool.Pool, file string) error {
	path := filepath.Join("..", "..", "migrations", file)
	content, err := os.ReadFile(path)
	if err != nil {
		return err
	}

	upSQL, err := extractGooseUpSection(string(content))
	if err != nil {
		return err
	}

	if _, err := pool.Exec(ctx, upSQL); err != nil {
		return err
	}
	return nil
}

func extractGooseUpSection(content string) (string, error) {
	lines := strings.Split(content, "\n")
	inUp := false
	upLines := make([]string, 0, len(lines))

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		switch trimmed {
		case "-- +goose Up":
			inUp = true
			continue
		case "-- +goose Down":
			inUp = false
			goto done
		}

		if !inUp {
			continue
		}
		if strings.HasPrefix(trimmed, "-- +goose") {
			continue
		}
		upLines = append(upLines, line)
	}

done:
	upSQL := strings.TrimSpace(strings.Join(upLines, "\n"))
	if upSQL == "" {
		return "", errors.New("goose up section is empty")
	}
	return upSQL, nil
}

func init() {
	// Integration tests may need more time for container boot.
	time.Local = time.UTC
}
