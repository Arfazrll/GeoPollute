package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Config holds all application configuration.
type Config struct {
	// Server
	APIHost string
	APIPort int
	GinMode string

	// Database
	DatabaseURL string

	// CORS
	CORSAllowedOrigins []string

	// Logging
	LogLevel string
}

// Load reads config from environment variables.
// If a .env file exists in working dir, it loads from there first.
func Load() (*Config, error) {
	// Try load .env (no error if file doesn't exist — production uses real env)
	_ = godotenv.Load()

	cfg := &Config{
		APIHost:            getEnv("API_HOST", "0.0.0.0"),
		GinMode:            getEnv("GIN_MODE", "debug"),
		DatabaseURL:        getEnv("DATABASE_URL", ""),
		CORSAllowedOrigins: parseCSV(getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173")),
		LogLevel:           getEnv("LOG_LEVEL", "info"),
	}

	port, err := strconv.Atoi(getEnv("API_PORT", "8080"))
	if err != nil {
		return nil, fmt.Errorf("invalid API_PORT: %w", err)
	}
	cfg.APIPort = port

	if err := cfg.validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// validate ensures critical fields are present.
func (c *Config) validate() error {
	if c.DatabaseURL == "" {
		return errors.New("DATABASE_URL is required")
	}
	if c.APIPort < 1 || c.APIPort > 65535 {
		return fmt.Errorf("API_PORT out of range: %d", c.APIPort)
	}
	if len(c.CORSAllowedOrigins) == 0 {
		return errors.New("CORS_ALLOWED_ORIGINS must have at least one origin")
	}
	return nil
}

// IsDev returns true if running in development mode.
func (c *Config) IsDev() bool {
	return strings.ToLower(c.GinMode) == "debug"
}

// Addr returns the server address in "host:port" format.
func (c *Config) Addr() string {
	return fmt.Sprintf("%s:%d", c.APIHost, c.APIPort)
}

// Helpers

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
