package service

import (
	"context"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type tableRepoStub struct {
	table             *model.Table
	getErr            error
	updateStatusTable *model.Table
	updateStatusErr   error
	lastUpdatedStatus model.TableStatus
}

func (s *tableRepoStub) ListActive(context.Context) ([]model.Table, error) {
	return nil, nil
}

func (s *tableRepoStub) GetByID(context.Context, uuid.UUID) (*model.Table, error) {
	if s.getErr != nil {
		return nil, s.getErr
	}
	return s.table, nil
}

func (s *tableRepoStub) Create(context.Context, int) (*model.Table, error) {
	return nil, nil
}

func (s *tableRepoStub) UpdateStatus(_ context.Context, _ uuid.UUID, status model.TableStatus) (*model.Table, error) {
	s.lastUpdatedStatus = status
	if s.updateStatusErr != nil {
		return nil, s.updateStatusErr
	}
	if s.updateStatusTable != nil {
		return s.updateStatusTable, nil
	}
	return s.table, nil
}

func (s *tableRepoStub) Deactivate(context.Context, uuid.UUID) error {
	return nil
}

type productRepoStub struct {
	product *model.Product
	err     error
}

func (s *productRepoStub) List(context.Context) ([]model.Product, error) {
	return nil, nil
}

func (s *productRepoStub) GetByID(context.Context, uuid.UUID) (*model.Product, error) {
	if s.err != nil {
		return nil, s.err
	}
	return s.product, nil
}

func (s *productRepoStub) Create(context.Context, repository.CreateProductParams) (*model.Product, error) {
	return nil, nil
}

func (s *productRepoStub) Update(context.Context, uuid.UUID, repository.UpdateProductParams) (*model.Product, error) {
	return nil, nil
}

func (s *productRepoStub) Delete(context.Context, uuid.UUID) error {
	return nil
}

type orderRepoStub struct {
	createOrder       *model.Order
	createErr         error
	getOrder          *model.Order
	getErr            error
	items             []model.OrderItem
	updateStatusErr   error
	nonReadyItems     int
	hasActiveByTable  bool
	updatedOrderState model.OrderStatus
}

func (s *orderRepoStub) Create(context.Context, repository.CreateOrderParams) (*model.Order, error) {
	if s.createErr != nil {
		return nil, s.createErr
	}
	return s.createOrder, nil
}

func (s *orderRepoStub) GetByID(context.Context, uuid.UUID) (*model.Order, error) {
	if s.getErr != nil {
		return nil, s.getErr
	}
	return s.getOrder, nil
}

func (s *orderRepoStub) ListItems(context.Context, uuid.UUID) ([]model.OrderItem, error) {
	return s.items, nil
}

func (s *orderRepoStub) AddItem(context.Context, repository.AddOrderItemParams) (*model.OrderItem, error) {
	return nil, nil
}

func (s *orderRepoStub) UpdateItem(context.Context, repository.UpdateOrderItemParams) (*model.OrderItem, error) {
	return nil, nil
}

func (s *orderRepoStub) DeleteItem(context.Context, uuid.UUID, uuid.UUID) error {
	return nil
}

func (s *orderRepoStub) UpdateStatus(_ context.Context, _ uuid.UUID, status model.OrderStatus) error {
	s.updatedOrderState = status
	return s.updateStatusErr
}

func (s *orderRepoStub) GetItemByID(context.Context, uuid.UUID, uuid.UUID) (*model.OrderItem, error) {
	return nil, nil
}

func (s *orderRepoStub) UpdateItemStatus(context.Context, uuid.UUID, uuid.UUID, model.ItemStatus) error {
	return nil
}

func (s *orderRepoStub) ListKitchenOrders(context.Context) ([]model.Order, error) {
	return nil, nil
}

func (s *orderRepoStub) CountNonReadyItems(context.Context, uuid.UUID) (int, error) {
	return s.nonReadyItems, nil
}

func (s *orderRepoStub) HasActiveOrdersByTable(context.Context, uuid.UUID) (bool, error) {
	return s.hasActiveByTable, nil
}

func TestOrderServiceCreateSetsTableOccupied(t *testing.T) {
	tableID := uuid.New()
	orderID := uuid.New()
	waiterID := uuid.New()

	tableRepo := &tableRepoStub{
		table: &model.Table{ID: tableID, Status: model.TableFree},
	}

	orderRepo := &orderRepoStub{
		createOrder: &model.Order{
			ID:       orderID,
			TableID:  tableID,
			WaiterID: waiterID,
			Status:   model.OrderOpen,
		},
		getOrder: &model.Order{
			ID:        orderID,
			TableID:   tableID,
			WaiterID:  waiterID,
			Status:    model.OrderOpen,
			CreatedAt: time.Now(),
		},
	}

	svc := NewOrderService(orderRepo, tableRepo, &productRepoStub{})
	order, err := svc.Create(context.Background(), tableID, waiterID, "test notes")
	require.NoError(t, err)
	require.NotNil(t, order)
	assert.Equal(t, model.TableOccupied, tableRepo.lastUpdatedStatus)
	assert.Equal(t, orderID, order.ID)
}

func TestOrderServiceCloseFailsWhenItemsNotReady(t *testing.T) {
	orderID := uuid.New()
	tableID := uuid.New()

	orderRepo := &orderRepoStub{
		getOrder: &model.Order{
			ID:      orderID,
			TableID: tableID,
			Status:  model.OrderSent,
		},
		nonReadyItems: 1,
	}
	tableRepo := &tableRepoStub{table: &model.Table{ID: tableID}}

	svc := NewOrderService(orderRepo, tableRepo, &productRepoStub{})
	_, err := svc.UpdateStatus(context.Background(), orderID, model.OrderClosed)
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrOrderCloseRequiresReady)
}

func TestOrderServiceCreateTableNotFound(t *testing.T) {
	tableID := uuid.New()
	waiterID := uuid.New()
	tableRepo := &tableRepoStub{getErr: pgx.ErrNoRows}
	orderRepo := &orderRepoStub{}

	svc := NewOrderService(orderRepo, tableRepo, &productRepoStub{})
	_, err := svc.Create(context.Background(), tableID, waiterID, "")
	require.Error(t, err)
	assert.ErrorIs(t, err, ErrTableNotFound)
}
