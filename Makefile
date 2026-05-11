.PHONY: help dev frontend-dev api-dev db-up db-down install lint test build clean

help:
	@echo "Available commands:"
	@echo "  make install        - Install all dependencies"
	@echo "  make dev            - Start full dev environment"
	@echo "  make frontend-dev   - Start frontend only"
	@echo "  make api-dev        - Start backend only"
	@echo "  make db-up          - Start Postgres container"
	@echo "  make db-down        - Stop Postgres container"
	@echo "  make lint           - Run linters"
	@echo "  make test           - Run all tests"
	@echo "  make build          - Build production images"
	@echo "  make clean          - Remove build artifacts"

install:
	cd frontend && npm install
	cd api && go mod download

frontend-dev:
	cd frontend && npm run dev

api-dev:
	cd api && go run cmd/server/main.go

db-up:
	docker compose up -d postgres

db-down:
	docker compose stop postgres

dev: db-up
	@echo "Starting frontend and API in parallel..."
	@(cd frontend && npm run dev) & \
	 (cd api && go run cmd/server/main.go)

lint:
	cd frontend && npm run lint
	cd api && golangci-lint run

test:
	cd frontend && npm test
	cd api && go test ./...

build:
	docker compose build

clean:
	rm -rf frontend/dist frontend/node_modules
	rm -rf api/bin