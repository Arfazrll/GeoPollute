package logger
import (
	"log/slog"
	"os"
	"strings"
)
func New(level string, isDev bool) *slog.Logger {
	logLevel := parseLevel(level)
	opts := &slog.HandlerOptions{
		Level:     logLevel,
		AddSource: isDev,
	}
	var handler slog.Handler
	if isDev {
		handler = slog.NewTextHandler(os.Stdout, opts)
	} else {
		handler = slog.NewJSONHandler(os.Stdout, opts)
	}
	return slog.New(handler)
}
func parseLevel(level string) slog.Level {
	switch strings.ToLower(level) {
	case "debug":
		return slog.LevelDebug
	case "info":
		return slog.LevelInfo
	case "warn", "warning":
		return slog.LevelWarn
	case "error":
		return slog.LevelError
	default:
		return slog.LevelInfo
	}
}