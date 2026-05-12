FROM node:20-alpine AS builder

WORKDIR /build

COPY package*.json ./

# Install build dependencies for native modules (like canvas)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pkgconfig \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev \
    giflib-dev

RUN npm ci

COPY . .

ARG VITE_API_BASE=http://localhost:8080
ARG VITE_USE_MOCK=false
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_USE_MOCK=$VITE_USE_MOCK

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /build/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]