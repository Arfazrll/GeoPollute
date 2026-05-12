.PHONY: run build test clean tidy deps help

help:
	@echo "Available commands:"
	@echo "  make run          - Run API server (development)"
	@echo "  make build        - Build production binary"
	@echo "  make test         - Run all tests"
	@echo "  make tidy         - Tidy go.mod"
	@echo "  make deps         - Download dependencies"
	@echo "  make clean        - Remove build artifacts"

run:
	go run cmd/server/main.go

build:
	go build -o bin/api cmd/server/main.go

test:
	go test ./...

tidy:
	go mod tidy

deps:
	go mod download

clean:
	rm -rf bin/