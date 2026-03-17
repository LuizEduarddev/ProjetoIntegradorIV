package service

import (
	"context"

	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type KitchenService struct {
	orders repository.OrderRepository
}

func NewKitchenService(orders repository.OrderRepository) *KitchenService {
	return &KitchenService{orders: orders}
}

func (s *KitchenService) ListOrders(ctx context.Context) ([]model.Order, error) {
	return s.orders.ListKitchenOrders(ctx)
}

func (s *KitchenService) UpdateItemStatus(
	ctx context.Context,
	orderID, itemID uuid.UUID,
	target model.ItemStatus,
) (*model.OrderItem, error) {
	if !isValidItemStatus(target) {
		return nil, ErrInvalidItemStatus
	}

	item, err := s.orders.GetItemByID(ctx, orderID, itemID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}

	if !isForwardItemTransition(item.Status, target) {
		return nil, ErrInvalidItemTransition
	}

	if err := s.orders.UpdateItemStatus(ctx, orderID, itemID, target); err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}

	return s.orders.GetItemByID(ctx, orderID, itemID)
}

func isValidItemStatus(status model.ItemStatus) bool {
	switch status {
	case model.ItemPending, model.ItemPreparing, model.ItemReady:
		return true
	default:
		return false
	}
}

func isForwardItemTransition(current, target model.ItemStatus) bool {
	switch current {
	case model.ItemPending:
		return target == model.ItemPreparing
	case model.ItemPreparing:
		return target == model.ItemReady
	default:
		return false
	}
}
