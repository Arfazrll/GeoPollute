package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	APIHost string
	APIPort int
	GinMode string

	DatabaseURL string

	CORSAllowedOrigins []string

	LogLevel string
}


func Load() (*Config, error) {
	_ = godotenv.Load()

	cfg := &Config{
		APIHost:            getEnv("API_HOST", ""),
		GinMode:            getEnv("GIN_MODE", "debug"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		CORSAllowedOrigins: parseCSV(getEnv("CORS_ALLOWED_ORIGINS", "")),
		LogLevel:           getEnv("LOG_LEVEL", "info"),
	}

	portStr := getEnv("API_PORT", "")
	if portStr == "" {
		return nil, errors.New("API_PORT is required")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return nil, fmt.Errorf("invalid API_PORT: %w", err)
	}
	cfg.APIPort = port

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}


func (c *Config) validate() error {
	if c.DatabaseURL == "" {
		return errors.New("DATABASE_URL is required")
	}
	if c.APIHost == "" {
		return errors.New("API_HOST is required")
	}
	if c.APIPort < 1 || c.APIPort > 65535 {
		return fmt.Errorf("API_PORT out of range: %d", c.APIPort)
	}
	if len(c.CORSAllowedOrigins) == 0 {
		return errors.New("CORS_ALLOWED_ORIGINS must have at least one origin")
	}
	return nil
}

func (c *Config) IsDev() bool {
	return strings.ToLower(c.GinMode) == "debug"
}

func (c *Config) Addr() string {
	return fmt.Sprintf("%s:%d", c.APIHost, c.APIPort)
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}



func parseCSV(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}
