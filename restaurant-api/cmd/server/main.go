package main

import (
	"context"
	"errors"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"restaurant-api/config"
	"restaurant-api/internal/handler"
	"restaurant-api/internal/middleware"
	"restaurant-api/internal/repository"
	"restaurant-api/internal/service"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	ctx := context.Background()

	dbConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("parse database config: %v", err)
	}
	dbConfig.MaxConns = cfg.DBMaxConns

	dbPool, err := pgxpool.NewWithConfig(ctx, dbConfig)
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}
	defer dbPool.Close()

	if err := dbPool.Ping(ctx); err != nil {
		log.Fatalf("ping database: %v", err)
	}

	userRepo := repository.NewUserRepository(dbPool)
	tableRepo := repository.NewTableRepository(dbPool)
	productRepo := repository.NewProductRepository(dbPool)
	orderRepo := repository.NewOrderRepository(dbPool)

	authService := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.JWTTTL)
	tableService := service.NewTableService(tableRepo)
	productService := service.NewProductService(productRepo)
	orderService := service.NewOrderService(orderRepo, tableRepo, productRepo)
	kitchenService := service.NewKitchenService(orderRepo)
	userService := service.NewUserService(userRepo)

	authHandler := handler.NewAuthHandler(authService)
	tableHandler := handler.NewTableHandler(tableService)
	productHandler := handler.NewProductHandler(productService)
	orderHandler := handler.NewOrderHandler(orderService)
	kitchenHandler := handler.NewKitchenHandler(kitchenService)
	userHandler := handler.NewUserHandler(userService)

	router := gin.New()
	router.Use(middleware.CORSAllowAll(), gin.Recovery(), requestLogger(logger))

	router.POST("/auth/login", authHandler.Login)

	protected := router.Group("/")
	protected.Use(middleware.IsAuthenticated(cfg.JWTSecret))
	{
		protected.GET("/tables", tableHandler.List)
		protected.POST("/tables", tableHandler.Create)
		protected.PATCH("/tables/:id/status", tableHandler.UpdateStatus)

		protected.GET("/products", productHandler.List)
		protected.POST("/products", productHandler.Create)
		protected.PATCH("/products/:id", productHandler.Update)
		protected.DELETE("/products/:id", productHandler.Delete)

		protected.POST("/orders", orderHandler.Create)
		protected.GET("/orders/:id", orderHandler.GetByID)
		protected.POST("/orders/:id/items", orderHandler.AddItem)
		protected.PATCH("/orders/:id/items/:itemId", orderHandler.UpdateItem)
		protected.DELETE("/orders/:id/items/:itemId", orderHandler.DeleteItem)
		protected.PATCH("/orders/:id/status", orderHandler.UpdateStatus)

		protected.GET("/kitchen/orders", kitchenHandler.ListOrders)
		protected.PATCH("/kitchen/orders/:orderId/items/:itemId/status", kitchenHandler.UpdateItemStatus)

		protected.GET("/users", userHandler.List)
		protected.POST("/users", userHandler.Create)
		protected.PATCH("/users/:id", userHandler.Update)
		protected.PATCH("/users/:id/deactivate", userHandler.Deactivate)
	}

	srv := &http.Server{
		Addr:              ":" + cfg.Port,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	go func() {
		logger.Info("server started", "port", cfg.Port, "env", cfg.Environment)
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("server error: %v", err)
		}
	}()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, syscall.SIGTERM, syscall.SIGINT)
	<-stop

	logger.Info("shutdown signal received")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.Error("graceful shutdown failed", "error", err)
	}
	logger.Info("server stopped")
}

func requestLogger(logger *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Info("request",
			"method", c.Request.Method,
			"path", c.Request.URL.Path,
			"status", c.Writer.Status(),
			"latency_ms", time.Since(start).Milliseconds(),
			"client_ip", c.ClientIP(),
		)
	}
}
