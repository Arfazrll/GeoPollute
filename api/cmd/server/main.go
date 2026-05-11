package main

import (
	"context"
	"log/slog"
	"os"

	"github.com/arfazrll/geopollute/api/internal/config"
	"github.com/arfazrll/geopollute/api/internal/db"
	"github.com/arfazrll/geopollute/api/pkg/logger"
	"github.com/jackc/pgx/v5/pgxpool"
)

func main() {
	// ---- Layer 2: Config + Logger ----
	cfg, err := config.Load()
	if err != nil {
		// Logger gak ke-init yet, pakai stderr biasa
		os.Stderr.WriteString("failed to load config: " + err.Error() + "\n")
		os.Exit(1)
	}

	log := logger.New(cfg.LogLevel, cfg.IsDev())
	log.Info("✓ Config loaded", "api_addr", cfg.Addr())

	// ---- Layer 3: Database Pool ----
	ctx := context.Background()
	pool, err := db.NewPool(ctx, cfg.DatabaseURL, db.DefaultPoolConfig(), log)
	if err != nil {
		log.Error("failed to connect database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	// Smoke tests
	if err := smokeTest(ctx, pool, log); err != nil {
		log.Error("smoke test failed", "error", err)
		os.Exit(1)
	}

	// Log pool stats
	db.LogPoolStats(pool, log)

	log.Info("Layer 3 setup complete — ready for Layer 4 (Models)")
}

// smokeTest verifies the database schema by querying expected tables.
func smokeTest(ctx context.Context, pool *pgxpool.Pool, log *slog.Logger) error {
	// Test 1: Postgres version
	var version string
	if err := pool.QueryRow(ctx, "SELECT version()").Scan(&version); err != nil {
		return err
	}
	displayVer := version
	if len(version) > 60 {
		displayVer = version[:60] + "..."
	}
	log.Info("✓ Postgres version", "value", displayVer)

	// Test 2: Count sensors
	var sensorCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM sensors").Scan(&sensorCount); err != nil {
		return err
	}
	log.Info("✓ Sensors table accessible", "count", sensorCount)

	// Test 3: Count readings
	var readingCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM pollutant_readings").Scan(&readingCount); err != nil {
		return err
	}
	log.Info("✓ Readings table accessible", "count", readingCount)

	// Test 4: Aggregates
	var hourlyCount, dailyCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM pollutant_aggregates_hourly").Scan(&hourlyCount); err != nil {
		return err
	}
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM pollutant_aggregates_daily").Scan(&dailyCount); err != nil {
		return err
	}
	log.Info("✓ Aggregates accessible", "hourly", hourlyCount, "daily", dailyCount)

	// Test 5: Sensor status
	var statusCount int
	if err := pool.QueryRow(ctx, "SELECT COUNT(*) FROM sensor_status").Scan(&statusCount); err != nil {
		return err
	}
	log.Info("✓ Sensor status accessible", "count", statusCount)

	return nil
}
