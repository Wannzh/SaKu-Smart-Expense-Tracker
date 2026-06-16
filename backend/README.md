# ⚙️ SaKu — Backend API Server

> Bagian dari monorepo [SaKu - Smart Expense Tracker](../README.md)

Kode sumber API server-side **SaKu**. Dibangun menggunakan **Express.js 5** dengan database relasional **PostgreSQL**, skema ORM **Prisma**, dan terintegrasi dengan **Google Gemini AI** untuk analisis finansial tingkat lanjut serta pemindaian struk berbasis OCR multimodal.

---

## 🛠️ Tech Stack & Dependensi Utama

| Paket | Kegunaan |
|-------|----------|
| Node.js (v20) | JavaScript runtime |
| Express.js (v5) | REST API framework |
| Prisma ORM | Database schema, migrations & type-safe queries |
| PostgreSQL | Relational database |
| Argon2 | Hashing password yang aman |
| JSON Web Token (JWT) | Pembuatan & verifikasi token auth |
| Cookie-parser | Autentikasi berbasis HttpOnly Cookie |
| Multer | Middleware upload file multipart/form-data |
| Cloudinary SDK | Penyimpanan media foto struk ke cloud |
| Google Gemini AI SDK | Asisten AI finansial & OCR nota/struk |

---

## 📁 Struktur Direktori

```
backend/
├── prisma/
│   ├── migrations/      # Riwayat migrasi skema database
│   ├── schema.prisma    # Definisi model & relasi tabel (sumber kebenaran)
│   └── seed.js          # Seeder data awal (kategori transaksi default)
├── src/
│   ├── controllers/     # Handler permintaan HTTP (request → response)
│   ├── middlewares/     # Auth guard, upload handler, error handler global
│   ├── routes/          # Definisi endpoint URL REST API Express
│   ├── services/        # Logika bisnis inti (Gemini AI, Cloudinary, Prisma)
│   ├── utils/           # Helper (JWT generator, formatter, dll.)
│   └── app.js           # Inisialisasi aplikasi Express & middleware stack
├── Dockerfile           # Konfigurasi Docker (Node 20 + pnpm + prisma generate)
└── package.json         # Dependensi & skrip pnpm backend
```

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di dalam folder ini berdasarkan template `.env.example`:

| Variabel | Keterangan |
|----------|------------|
| `PORT` | Port server API (default: `5001`) |
| `DATABASE_URL` | URI koneksi PostgreSQL utama (pooling) |
| `DIRECT_URL` | URI koneksi langsung PostgreSQL (khusus migrasi Prisma) |
| `JWT_SECRET` | Kunci enkripsi token JWT (gunakan string acak panjang) |
| `COOKIE_SECRET` | Kunci penandatanganan sesi cookie |
| `GOOGLE_CLIENT_ID` | Client ID OAuth dari Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Client Secret OAuth dari Google Cloud Console |
| `GEMINI_API_KEY` | API Key dari Google AI Studio |
| `CLOUDINARY_URL` | URI lengkap integrasi Cloudinary |
| `CLIENT_URL` | URL frontend (lokal: `http://localhost:5173`) |

---

## 🤖 Integrasi Gemini AI & OCR Nota

Modul AI terpusat berada di `src/services/ai.service.js` dengan dua kemampuan utama:

### 1. AI OCR Struk (Multimodal Vision)
- **Input**: Foto struk belanja (JPEG/PNG) yang diunggah pengguna
- **Proses**: Model Gemini Vision menganalisis gambar dan mengekstrak:
  - Nominal transaksi
  - Nama merchant / toko
  - Tanggal transaksi
  - Kategori pengeluaran yang relevan
- **Output**: Objek JSON terstruktur siap disimpan ke database

### 2. Asisten Finansial AI (Chat)
- Menjawab pertanyaan seputar perencanaan anggaran dan saran keuangan
- Memahami konteks portofolio: saldo dompet, riwayat transaksi, dan budget pengguna secara real-time

---

## 🏃 Skrip Database & Server (pnpm)

Jalankan dari dalam folder `backend/` atau dari root workspace dengan filter `--filter backend`:

```bash
# Mode pengembangan (Nodemon watch)
pnpm dev

# Mode produksi
pnpm start

# Generate Prisma Client (wajib setelah clone pertama kali)
pnpm db:generate

# Buat & terapkan migrasi skema baru ke database
pnpm db:migrate

# Isi data awal kategori transaksi
pnpm db:seed
```
