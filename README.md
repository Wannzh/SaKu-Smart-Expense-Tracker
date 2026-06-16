# 🪙 SaKu — Smart Expense Tracker

<div align="center">

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](docker-compose.yml)

**SaKu** adalah aplikasi pencatat keuangan pribadi berbasis web yang dilengkapi kecerdasan buatan (AI) untuk pemindaian struk otomatis dan asisten finansial interaktif.

[🚀 Fitur](#-fitur-utama) · [🛠️ Tech Stack](#%EF%B8%8F-tech-stack) · [💻 Menjalankan Lokal](#-panduan-menjalankan-secara-lokal) · [🐋 Docker](#-panduan-menjalankan-dengan-docker-compose)

</div>

---

## 📋 Daftar Isi

- [Deskripsi](#-saku--smart-expense-tracker)
- [Fitur Utama](#-fitur-utama)
- [ERD (Skema Database)](#-diagram-hubungan-entitas-erd)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Menjalankan Secara Lokal](#-panduan-menjalankan-secara-lokal)
- [Menjalankan dengan Docker](#-panduan-menjalankan-dengan-docker-compose)
- [Lisensi](#-lisensi)

---

## 🚀 Fitur Utama

Aplikasi SaKu dilengkapi dengan fitur keuangan lengkap yang terintegrasi secara dinamis:

| Fitur | Deskripsi |
|-------|-----------|
| 🔐 **Autentikasi Aman** | JWT & HttpOnly Cookie, Google OAuth, validasi input instan |
| 💳 **Multi-Wallet** | Kelola tunai, rekening bank, dan e-wallet dalam satu dasbor |
| 📝 **Transaksi** | Catat pemasukan & pengeluaran dengan kategori & subkategori kustom |
| 💸 **Transfer Dompet** | Pindah saldo antar dompet dengan pencatatan mutasi otomatis |
| 📊 **Anggaran (Budget)** | Tetapkan batas pengeluaran per kategori dengan progress bar visual |
| 🤝 **Utang & Piutang** | Lacak utang/piutang beserta riwayat cicilan hingga lunas |
| ⭐ **Wishlist** | Rencanakan pembelian impian dengan kalkulasi alokasi tabungan otomatis |
| 🔄 **Transaksi Berulang** | Otomatisasi tagihan/langganan berkala |
| 📥 **Ekspor Laporan** | Unduh laporan dalam format Excel (`.xlsx`) atau PDF |
| 📸 **AI OCR Struk** | Unggah foto struk — AI mengekstrak nominal, toko, dan tanggal secara otomatis |
| 🤖 **Asisten AI (Gemini)** | Chatbot berbasis Google Gemini AI yang mengenali data keuangan Anda secara real-time |

---

## 📊 Diagram Hubungan Entitas (ERD)

> [!NOTE]
> Tambahkan gambar ERD Anda di sini setelah menghasilkannya dari skema Prisma.
> Letakkan file di `docs/erd.png` lalu uncomment baris di bawah ini:

<!-- ![SaKu ERD](./docs/erd.png) -->

Untuk menghasilkan ERD secara otomatis dari `backend/prisma/schema.prisma`, gunakan:
- [Prisma ERD Generator](https://github.com/keonik/prisma-erd-generator) — CLI generator SVG/PNG
- [dbdiagram.io](https://dbdiagram.io) — editor visual diagram relasi database

---

## 🛠️ Tech Stack

### 💻 Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| React | v19 | UI Library |
| Vite | v8 | Build tool & Dev server |
| React Router DOM | v7 | Client-side routing |
| Tailwind CSS | v4 | Utility-first styling |
| Axios | latest | HTTP client (dengan cookie credentials) |
| Recharts | latest | Visualisasi data statistik |
| Lucide React | latest | Ikon modern |

### ⚙️ Backend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| Node.js | v20 | JavaScript runtime |
| Express.js | v5 | REST API framework |
| Prisma ORM | v7 | Database schema & query |
| PostgreSQL | v15 | Relational database |
| Argon2 | latest | Password hashing |
| JWT + Cookie-parser | latest | Autentikasi & sesi |
| Cloudinary SDK | latest | Penyimpanan media cloud |
| Google Gemini AI | latest | Asisten AI & OCR struk |

### 🐋 DevOps & Deployment
| Teknologi | Kegunaan |
|-----------|----------|
| Docker & Docker Compose | Containerization semua layanan |
| Nginx | Reverse proxy & serving static assets |
| pnpm Workspace | Monorepo package management |

---

## 💻 Panduan Menjalankan Secara Lokal

### Prasyarat
- **Node.js** ≥ 20
- **pnpm** (`npm install -g pnpm`)
- Instance **PostgreSQL** aktif (lokal atau Supabase/RDS)
- Akun **Cloudinary** & **Google AI Studio** (untuk Gemini Key)

### Langkah Pemasangan

**1. Clone Repositori**
```bash
git clone https://github.com/Wannzh/SaKu-Smart-Expense-Tracker.git
cd SaKu-Smart-Expense-Tracker
```

**2. Instalasi Dependensi**
```bash
pnpm install
```

**3. Konfigurasi Variabel Lingkungan**
```bash
# Backend
cp backend/.env.example backend/.env
# → Isi DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, dll.

# Frontend
cp frontend/.env.example frontend/.env
# → Isi VITE_API_URL dan VITE_GOOGLE_CLIENT_ID
```

**4. Setup Database**
```bash
cd backend

# Generate Prisma Client
pnpm db:generate

# Jalankan migrasi skema tabel
pnpm db:migrate

# Isi data awal (kategori transaksi)
pnpm db:seed

cd ..
```

**5. Jalankan Mode Pengembangan**
```bash
pnpm dev
```

| Layanan | URL |
|---------|-----|
| Frontend | `http://localhost:5173` |
| Backend API | `http://localhost:5001` |

---

## 🐋 Panduan Menjalankan dengan Docker Compose

Untuk deployment produksi ke VPS secara instan:

**1. Siapkan environment file**
```bash
cp .env.example .env
# → Sesuaikan DB_PASSWORD, JWT_SECRET, VITE_API_URL, dll. dengan konfigurasi VPS Anda
```

**2. Build & jalankan semua kontainer**
```bash
docker compose up -d --build
```

**3. Akses aplikasi**

| Layanan | Alamat |
|---------|--------|
| Frontend | `http://<ip-vps>` (port 80) |
| Backend API | `http://<ip-vps>:5001` |
| PostgreSQL | Internal (port 5432 terbuka untuk akses luar jika diperlukan) |

**4. Perintah berguna lainnya**
```bash
# Melihat log semua kontainer
docker compose logs -f

# Mematikan semua layanan
docker compose down

# Mematikan + hapus data volume (⚠️ data database ikut terhapus)
docker compose down -v
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License** — bebas digunakan, dimodifikasi, dan didistribusikan.

---

<div align="center">
  <sub>Dibuat dengan ❤️ oleh <a href="https://github.com/Wannzh">Wannzh</a></sub>
</div>
