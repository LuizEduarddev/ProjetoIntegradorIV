package service

import (
	"context"

	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type OrderService struct {
	orders   repository.OrderRepository
	tables   repository.TableRepository
	products repository.ProductRepository
}

func NewOrderService(
	orders repository.OrderRepository,
	tables repository.TableRepository,
	products repository.ProductRepository,
) *OrderService {
	return &OrderService{
		orders:   orders,
		tables:   tables,
		products: products,
	}
}

func (s *OrderService) Create(ctx context.Context, tableID, waiterID uuid.UUID, notes string) (*model.Order, error) {
	if _, err := s.tables.GetByID(ctx, tableID); err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrTableNotFound
		}
		return nil, err
	}

	order, err := s.orders.Create(ctx, repository.CreateOrderParams{
		TableID:  tableID,
		WaiterID: waiterID,
		Notes:    notes,
	})
	if err != nil {
		return nil, err
	}

	if _, err := s.tables.UpdateStatus(ctx, tableID, model.TableOccupied); err != nil {
		return nil, err
	}

	return s.GetByID(ctx, order.ID)
}

func (s *OrderService) GetByID(ctx context.Context, orderID uuid.UUID) (*model.Order, error) {
	order, err := s.orders.GetByID(ctx, orderID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	items, err := s.orders.ListItems(ctx, orderID)
	if err != nil {
		return nil, err
	}
	order.Items = items
	return order, nil
}

func (s *OrderService) AddItem(ctx context.Context, orderID, productID uuid.UUID, quantity int, notes string) (*model.OrderItem, error) {
	if quantity <= 0 {
		return nil, ErrInvalidInput
	}

	order, err := s.orders.GetByID(ctx, orderID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	if order.Status != model.OrderOpen {
		return nil, ErrOrderItemsLocked
	}

	product, err := s.products.GetByID(ctx, productID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	if !product.Available {
		return nil, ErrProductUnavailable
	}

	return s.orders.AddItem(ctx, repository.AddOrderItemParams{
		OrderID:   orderID,
		ProductID: productID,
		Quantity:  quantity,
		UnitPrice: product.Price,
		Notes:     notes,
	})
}

func (s *OrderService) UpdateItem(
	ctx context.Context,
	orderID, itemID uuid.UUID,
	quantity *int,
	notes *string,
) (*model.OrderItem, error) {
	order, err := s.orders.GetByID(ctx, orderID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}
	if order.Status != model.OrderOpen {
		return nil, ErrOrderItemsLocked
	}

	currentItem, err := s.orders.GetItemByID(ctx, orderID, itemID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderItemNotFound
		}
		return nil, err
	}

	nextQty := currentItem.Quantity
	if quantity != nil {
		nextQty = *quantity
	}
	if nextQty <= 0 {
		return nil, ErrInvalidInput
	}

	nextNotes := currentItem.Notes
	if notes != nil {
		nextNotes = *notes
	}

	return s.orders.UpdateItem(ctx, repository.UpdateOrderItemParams{
		OrderID:  orderID,
		ItemID:   itemID,
		Quantity: nextQty,
		Notes:    nextNotes,
	})
}

func (s *OrderService) DeleteItem(ctx context.Context, orderID, itemID uuid.UUID) error {
	order, err := s.orders.GetByID(ctx, orderID)
	if err != nil {
		if repository.IsNotFound(err) {
			return ErrOrderNotFound
		}
		return err
	}
	if order.Status != model.OrderOpen {
		return ErrOrderItemsLocked
	}

	if err := s.orders.DeleteItem(ctx, orderID, itemID); err != nil {
		if repository.IsNotFound(err) {
			return ErrOrderItemNotFound
		}
		return err
	}
	return nil
}

func (s *OrderService) UpdateStatus(ctx context.Context, orderID uuid.UUID, target model.OrderStatus) (*model.Order, error) {
	order, err := s.orders.GetByID(ctx, orderID)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	if !isValidOrderStatus(target) {
		return nil, ErrInvalidOrderStatus
	}
	if !canTransitionOrder(order.Status, target) {
		return nil, ErrInvalidOrderTransition
	}

	if target == model.OrderClosed {
		nonReady, err := s.orders.CountNonReadyItems(ctx, orderID)
		if err != nil {
			return nil, err
		}
		if nonReady > 0 {
			return nil, ErrOrderCloseRequiresReady
		}
	}

	if err := s.orders.UpdateStatus(ctx, orderID, target); err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrOrderNotFound
		}
		return nil, err
	}

	switch target {
	case model.OrderSent:
		if _, err := s.tables.UpdateStatus(ctx, order.TableID, model.TableWaiting); err != nil {
			return nil, err
		}
	case model.OrderClosed, model.OrderCancelled:
		hasActiveOrders, err := s.orders.HasActiveOrdersByTable(ctx, order.TableID)
		if err != nil {
			return nil, err
		}
		if !hasActiveOrders {
			if _, err := s.tables.UpdateStatus(ctx, order.TableID, model.TableFree); err != nil {
				return nil, err
			}
		}
	}

	return s.GetByID(ctx, orderID)
}

func isValidOrderStatus(status model.OrderStatus) bool {
	switch status {
	case model.OrderOpen, model.OrderSent, model.OrderClosed, model.OrderCancelled:
		return true
	default:
		return false
	}
}

func canTransitionOrder(current, target model.OrderStatus) bool {
	switch current {
	case model.OrderOpen:
		return target == model.OrderSent || target == model.OrderCancelled
	case model.OrderSent:
		return target == model.OrderClosed || target == model.OrderCancelled
	default:
		return false
	}
}
