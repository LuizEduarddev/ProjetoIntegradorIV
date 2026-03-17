package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"restaurant-api/internal/model"
	"restaurant-api/internal/service"
)

type tableRepoHandlerStub struct {
	tables []model.Table
}

func (s *tableRepoHandlerStub) ListActive(context.Context) ([]model.Table, error) {
	return s.tables, nil
}

func (s *tableRepoHandlerStub) GetByID(context.Context, uuid.UUID) (*model.Table, error) {
	return nil, pgx.ErrNoRows
}

func (s *tableRepoHandlerStub) Create(context.Context, int) (*model.Table, error) {
	return &model.Table{ID: uuid.New(), Number: 10, Status: model.TableFree, Active: true}, nil
}

func (s *tableRepoHandlerStub) UpdateStatus(context.Context, uuid.UUID, model.TableStatus) (*model.Table, error) {
	return nil, nil
}

func (s *tableRepoHandlerStub) Deactivate(context.Context, uuid.UUID) error {
	return nil
}

func TestTableHandlerList(t *testing.T) {
	gin.SetMode(gin.TestMode)
	svc := service.NewTableService(&tableRepoHandlerStub{
		tables: []model.Table{
			{ID: uuid.New(), Number: 1, Status: model.TableFree, Active: true},
		},
	})
	handler := NewTableHandler(svc)

	router := gin.New()
	router.GET("/tables", handler.List)

	req := httptest.NewRequest(http.MethodGet, "/tables", nil)
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	var payload []model.Table
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &payload))
	require.Len(t, payload, 1)
}

func TestTableHandlerCreate(t *testing.T) {
	gin.SetMode(gin.TestMode)
	svc := service.NewTableService(&tableRepoHandlerStub{})
	handler := NewTableHandler(svc)

	router := gin.New()
	router.POST("/tables", handler.Create)

	req := httptest.NewRequest(http.MethodPost, "/tables", bytes.NewReader([]byte(`{"number":10}`)))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)

	assert.Equal(t, http.StatusCreated, rr.Code)
}
