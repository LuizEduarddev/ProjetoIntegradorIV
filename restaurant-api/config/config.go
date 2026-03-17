package config

import (
	"errors"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	JWTTTL      time.Duration
	DBMaxConns  int32
	Environment string
}

func Load() (Config, error) {
	jwtTTLHours, err := getEnvAsInt("JWT_TTL_HOURS", 24)
	if err != nil {
		return Config{}, err
	}

	maxConns, err := getEnvAsInt("DB_MAX_CONNS", 25)
	if err != nil {
		return Config{}, err
	}

	cfg := Config{
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getFirstEnv("DATABASE_URL", "GOOSE_DBSTRING"),
		JWTSecret:   os.Getenv("JWT_SECRET"),
		JWTTTL:      time.Duration(jwtTTLHours) * time.Hour,
		DBMaxConns:  int32(maxConns),
		Environment: getEnv("APP_ENV", "development"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, errors.New("missing DATABASE_URL or GOOSE_DBSTRING")
	}
	if cfg.JWTSecret == "" {
		return Config{}, errors.New("missing JWT_SECRET")
	}

	return cfg, nil
}

func getEnv(key, fallback string) string {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	return v
}

func getEnvAsInt(key string, fallback int) (int, error) {
	v := os.Getenv(key)
	if v == "" {
		return fallback, nil
	}
	parsed, err := strconv.Atoi(v)
	if err != nil {
		return 0, errors.New("invalid " + key)
	}
	return parsed, nil
}

func getFirstEnv(keys ...string) string {
	for _, key := range keys {
		v := os.Getenv(key)
		if v != "" {
			return v
		}
	}
	return ""
}
