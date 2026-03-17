package service

import (
	"context"

	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type TableService struct {
	tables repository.TableRepository
}

func NewTableService(tables repository.TableRepository) *TableService {
	return &TableService{tables: tables}
}

func (s *TableService) List(ctx context.Context) ([]model.Table, error) {
	return s.tables.ListActive(ctx)
}

func (s *TableService) Create(ctx context.Context, number int) (*model.Table, error) {
	if number <= 0 {
		return nil, ErrInvalidInput
	}

	table, err := s.tables.Create(ctx, number)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, ErrTableNumberAlreadyExists
		}
		return nil, err
	}
	return table, nil
}

func (s *TableService) UpdateStatus(ctx context.Context, id uuid.UUID, status model.TableStatus) (*model.Table, error) {
	if !isValidTableStatus(status) {
		return nil, ErrInvalidTableStatus
	}

	table, err := s.tables.UpdateStatus(ctx, id, status)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrTableNotFound
		}
		return nil, err
	}
	return table, nil
}

func isValidTableStatus(status model.TableStatus) bool {
	switch status {
	case model.TableFree, model.TableOccupied, model.TableWaiting, model.TableClosed:
		return true
	default:
		return false
	}
}
