package service

import (
	"context"
	"log"

	"github.com/google/uuid"

	"restaurant-api/internal/model"
	"restaurant-api/internal/repository"
)

type ProductService struct {
	products repository.ProductRepository
}

func NewProductService(products repository.ProductRepository) *ProductService {
	return &ProductService{products: products}
}

func (s *ProductService) List(ctx context.Context) ([]model.Product, error) {
	return s.products.List(ctx)
}

func (s *ProductService) GetByID(ctx context.Context, id uuid.UUID) (*model.Product, error) {
	product, err := s.products.GetByID(ctx, id)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	return product, nil
}

func (s *ProductService) Create(ctx context.Context, params repository.CreateProductParams) (*model.Product, error) {
	if params.Price < 0 {
		return nil, ErrInvalidProductPrice
	}
	return s.products.Create(ctx, params)
}

func (s *ProductService) Update(ctx context.Context, id uuid.UUID, params repository.UpdateProductParams) (*model.Product, error) {
	if params.Price < 0 {
		return nil, ErrInvalidProductPrice
	}
	product, err := s.products.Update(ctx, id, params)
	if err != nil {
		if repository.IsNotFound(err) {
			return nil, ErrProductNotFound
		}
		return nil, err
	}
	return product, nil
}

func (s *ProductService) Delete(ctx context.Context, id uuid.UUID) error {
	if err := s.products.Delete(ctx, id); err != nil {
		if repository.IsNotFound(err) {
			return ErrProductNotFound
		}
		log.Println(err)
		return err
	}
	return nil
}
