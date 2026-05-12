package db

import (
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

// LogPoolStats logs current pool statistics.
// Useful for periodic monitoring or debugging.
func LogPoolStats(pool *pgxpool.Pool, log *slog.Logger) {
	stats := pool.Stat()
	log.Info("DB pool stats",
		"total_conns", stats.TotalConns(),
		"acquired_conns", stats.AcquiredConns(),
		"idle_conns", stats.IdleConns(),
		"acquire_count", stats.AcquireCount(),
		"acquire_duration_ms", stats.AcquireDuration().Milliseconds(),
	)
}
