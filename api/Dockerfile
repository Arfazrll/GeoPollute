FROM golang:1.26-alpine AS builder

WORKDIR /build

RUN apk add --no-cache git ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags='-w -s -extldflags "-static"' \
    -tags timetzdata \
    -o /build/bin/api \
    cmd/server/main.go


FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /app

COPY --from=builder /build/bin/api /app/api
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

USER nonroot:nonroot

EXPOSE 8080

ENTRYPOINT ["/app/api"]