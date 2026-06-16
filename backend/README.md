# ⚙️ SaKu - Backend API Server

Bagian ini berisi kode sumber API server-side **SaKu (Smart Expense Tracker)**. Dibangun menggunakan **Express.js** dengan database relasional **PostgreSQL**, skema ORM **Prisma**, dan terintegrasi dengan **Google Gemini AI** untuk analisis finansial tingkat lanjut.

---

## 🛠️ Tech Stack & Dependensi Utama

*   **Runtime & Server Framework**: Node.js, Express.js (Express 5)
*   **Database ORM & Driver**: Prisma ORM, PostgreSQL Driver (`pg`)
*   **Authentication & Security**: Argon2 (untuk hashing password), JSON Web Token (JWT), Cookie-parser (untuk otentikasi aman berbasis HttpOnly Cookie)
*   **AI Engine**: Google Gemini API SDK (`@google/generative-ai`)
*   **Media Uploads**: Multer & Cloudinary SDK (untuk mengunggah berkas foto nota/struk secara aman ke cloud storage)

---

## 📁 Struktur Direktori

```
backend/
├── prisma/
│   ├── migrations/      # Riwayat berkas migrasi database PostgreSQL
│   ├── schema.prisma    # Definisi skema tabel database (Prisma Schema)
│   └── seed.js          # Skrip seeder untuk mengisi data awal kategori transaksi
├── src/
│   ├── controllers/     # Logika pemrosesan permintaan API (request & response)
│   ├── middlewares/     # Middleware keamanan (auth guard, upload handler, error handling)
│   ├── routes/          # Definisi rute URL API Express
│   ├── services/        # Logika bisnis inti (Gemini AI, Cloudinary upload, Prisma queries)
│   ├── utils/           # Fungsi helper (JWT token generator, format, dll.)
│   └── app.js           # Entrypoint inisialisasi aplikasi Express
├── Dockerfile           # Konfigurasi multi-stage build backend Docker
└── package.json         # Dependensi & skrip pnpm backend
```

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di dalam folder ini berdasarkan template `.env.example`:

*   `PORT`: Port lokal tempat API berjalan (default: `5001`).
*   `DATABASE_URL`: URI koneksi database PostgreSQL utama (mendukung transaction/pooling).
*   `DIRECT_URL`: URI koneksi langsung ke PostgreSQL (digunakan untuk migrasi skema database).
*   `JWT_SECRET` & `COOKIE_SECRET`: Kunci enkripsi acak untuk keamanan token dan sesi cookie.
*   `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Kredensial integrasi Google OAuth Client.
*   `GEMINI_API_KEY`: Kunci API Google AI Studio Anda untuk asisten keuangan pintar.
*   `CLOUDINARY_URL`: URI integrasi penyimpanan media Cloudinary.
*   `CLIENT_URL`: Alamat URL aplikasi frontend Anda (lokal: `http://localhost:5173`).

---

## 🤖 Integrasi Gemini AI & OCR Nota

Backend SaKu memiliki modul kecerdasan buatan terdedikasi di `/src/services/ai.service.js`:
1.  **AI OCR Nota**: Menggunakan model penglihatan multimodal Gemini untuk memindai berkas gambar struk belanja, mengekstrak data nominal secara otomatis, mengenali merchant/toko, mendeteksi tanggal transaksi, dan mengklasifikasikan kategori transaksi secara cerdas.
2.  **Asisten AI (Chatbot)**: Mampu membalas pertanyaan pengguna mengenai perencanaan anggaran, saran pengeluaran, serta memahami konteks portofolio keuangan dan sisa saldo dompet pengguna secara real-time.

---

## 🏃 Skrip Database & Server (pnpm)

Dari dalam folder `backend/` atau menggunakan filter dari root workspace:

*   **Menjalankan Mode Pengembangan (Nodemon)**:
    ```bash
    pnpm dev
    ```
*   **Menjalankan Mode Produksi**:
    ```bash
    pnpm start
    ```
*   **Membuat Migrasi Baru & Menerapkan ke Database**:
    ```bash
    pnpm db:migrate
    ```
*   **Mengisi Data Awal (Seed)**:
    ```bash
    pnpm db:seed
    ```
*   **Membuat/Menghasilkan Prisma Client**:
    ```bash
    pnpm db:generate
    ```
