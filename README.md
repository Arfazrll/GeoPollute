# GeoPollute: Sistem Pemetaan Polutan Spasial Interaktif

Sistem pemantauan kualitas udara berbasis web yang menyajikan visualisasi data polutan dari sensor IoT secara real-time. Aplikasi ini menggunakan algoritma Inverse Distance Weighting (IDW) untuk menghasilkan heatmap polusi yang kontinu pada peta interaktif.

## Arsitektur Sistem

Sistem ini terbagi menjadi dua komponen utama:

1.  **Backend (api)**: Dibangun menggunakan bahasa pemrograman Go dengan framework Gin. Bertanggung jawab atas pengelolaan REST API, integrasi PostgreSQL, dan agregasi data time-series.
2.  **Frontend (frontend)**: Dibangun menggunakan React dan TypeScript. Menangani rendering peta menggunakan GeoJS, komputasi spasial menggunakan Turf.js, dan manajemen state menggunakan Zustand.

## Persyaratan Sistem

- Go 1.26.3 atau lebih baru
- Node.js 18.x atau lebih baru
- PostgreSQL 15 atau lebih baru
- Python 3.10+ (untuk script seeder)

## Konfigurasi Lingkungan

Salin file `.env.example` menjadi `.env` pada folder root, `api/`, dan `frontend/`. Pastikan variabel berikut telah dikonfigurasi:

### Backend (api/.env)
- `DATABASE_URL`: String koneksi PostgreSQL.
- `CORS_ALLOWED_ORIGINS`: Daftar origin yang diizinkan (misal: http://localhost:5173).

### Frontend (frontend/.env)
- `VITE_API_BASE`: URL dasar API backend.

## Petunjuk Instalasi

### 1. Persiapan Database
Jalankan migrasi SQL yang tersedia di folder `db/` untuk membuat skema tabel dan fungsi agregat.

### 2. Backend
```bash
cd api
go mod download
go run cmd/server/main.go
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Seeder Data (Opsional)
Untuk mengisi data awal guna keperluan demonstrasi:
```bash
pip install -r db/seeds/requirements.txt
python db/seeds/seeder.py
```

## Fitur Utama

- **Filter Waktu Dinamis**: Mendukung visualisasi data real-time (2 menit), rata-rata per jam, dan rata-rata harian.
- **Auto-Refresh**: Pembaruan data otomatis setiap 120 detik pada mode real-time.
- **Interpolasi Spasial**: Grid heksagonal IDW yang diproses di sisi klien untuk performa optimal.
- **Graceful Shutdown**: Penanganan terminasi server yang aman untuk menjaga integritas data.

## Deployment

Sistem ini dirancang untuk dijalankan menggunakan kontainer Docker. Konfigurasi Dockerfile tersedia di masing-masing folder layanan. Gunakan Traefik sebagai reverse proxy untuk menangani perutean trafik dan SSL di lingkungan produksi.
