# 🪙 SaKu - Smart Expense Tracker

**SaKu** (Smart Expense Tracker) adalah aplikasi pencatat keuangan pintar berbasis web yang dirancang untuk membantu Anda memantau, merencanakan, dan mengoptimalkan kondisi finansial secara presisi. Dibangun dengan struktur **monorepo** menggunakan **pnpm workspace**, SaKu mengintegrasikan teknologi modern seperti kecerdasan buatan (AI) untuk asisten finansial interaktif serta pemindaian struk otomatis.

---

## 🚀 Fitur Utama

Aplikasi SaKu dilengkapi dengan fitur-fitur keuangan lengkap yang terintegrasi secara dinamis:

*   🔐 **Autentikasi Aman (JWT & Cookie-based Session)**: Registrasi dan masuk akun yang aman dengan validasi input instan, dukungan login sekali klik lewat Google OAuth, serta sesi cookie yang terlindungi.
*   💳 **Manajemen Dompet (Multi-Wallet)**: Membuat dan mengelola berbagai sumber dana (Tunai, Rekening Bank, E-Wallet) dengan opsi kustomisasi warna dan tipe dompet.
*   📝 **Pencatatan Transaksi Finansial**: Pencatatan riwayat Pemasukan (*Income*) dan Pengeluaran (*Expense*) secara detail, lengkap dengan kategori visual yang menarik.
*   🗂️ **Kategori & Subkategori Kustom**: Pengelompokan pengeluaran secara terstruktur dengan subkategori untuk pelacakan yang lebih mendalam.
*   💸 **Transfer Antar Dompet**: Fitur pemindahan saldo dari satu dompet ke dompet lainnya dengan pencatatan mutasi otomatis.
*   📊 **Manajemen Anggaran (Budgeting)**: Batasi pengeluaran Anda dengan menetapkan batas anggaran bulanan per kategori. Dilengkapi dengan indikator visual *progress bar* yang berubah warna sesuai tingkat pemakaian.
*   🤝 **Manajemen Utang & Piutang (Debts & Receivables)**: Pelacakan utang dan piutang terintegrasi beserta pencatatan riwayat cicilan pembayaran hingga lunas.
*   ⭐️ **Wishlist Belanja (Daftar Impian)**: Rencanakan pembelian barang impian Anda. Sistem akan menghitung alokasi tabungan dari saldo aktif dompet Anda secara otomatis.
*   🔄 **Transaksi Berulang (Recurring Transactions)**: Otomatisasi transaksi berkala (seperti biaya langganan bulanan atau tagihan rutin) sehingga saldo terpotong otomatis tepat waktu.
*   📥 **Ekspor Laporan Keuangan**: Unduh laporan keuangan Anda dalam format file Microsoft Excel (`.xlsx`) atau PDF untuk analisis data yang lebih luas.
*   📸 **Scan Nota/Struk Otomatis (AI OCR)**: Cukup unggah foto struk belanja Anda, AI akan mengekstrak detail nominal, nama toko, tanggal, hingga kategori transaksi secara otomatis.
*   🤖 **Asisten Keuangan Pintar (Gemini AI Chat)**: Konsultasikan kondisi finansial Anda secara interaktif dengan chatbot AI yang mengenali data keuangan dan dompet Anda secara langsung.

---

## 📊 Diagram Hubungan Entitas (ERD)

Untuk memetakan relasi data di dalam database PostgreSQL, berikut adalah visualisasi skema database dari sistem migrasi Prisma ORM kami:

```
[ MASUKKAN GAMBAR ERD DI SINI ]
Misal: ![SaKu ERD](./docs/assets/erd_diagram.png)
```

> 💡 **Petunjuk Pengembang**: 
> Anda dapat menghasilkan gambar diagram ERD dari berkas schema prisma Anda menggunakan alat seperti [Prisma ERD Generator](https://github.com/keonik/prisma-erd-generator) atau skema eksternal dbdiagram.io, lalu simpan file gambar di dalam folder proyek dan perbarui tautan gambar di atas.

---

## 🛠️ Tech Stack

### 💻 Frontend
*   **Core Framework**: React (Vite)
*   **Routing**: React Router DOM (v7)
*   **Styling**: Tailwind CSS & Vanilla CSS (Desain Premium dengan dukungan Dark Mode via CSS Variables)
*   **Icons**: Lucide React
*   **HTTP Client**: Axios
*   **State Management**: Context API (untuk Auth & Theme global)

### ⚙️ Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js (Express 5)
*   **Database ORM**: Prisma ORM
*   **Authentication**: JSON Web Token (JWT) & Cookie-parser
*   **Media Storage**: Cloudinary SDK (untuk penyimpanan berkas unggahan bukti nota/struk)
*   **AI Engine**: Google Gemini AI API (`@google/generative-ai`)

### 🗄️ Database
*   **DBMS**: PostgreSQL (Relational Database)

### 🐋 DevOps & Deployment
*   **Containerization**: Docker & Docker Compose
*   **Reverse Proxy**: Nginx (untuk penyajian static assets frontend di port `80`)

---

## 💻 Panduan Menjalankan Secara Lokal

### Prasyarat
*   Node.js versi 20 atau lebih tinggi
*   pnpm Package Manager (`npm install -g pnpm`)
*   Layanan PostgreSQL (atau menggunakan instance Supabase/RDS)
*   Akun Cloudinary & Google AI Studio (untuk Gemini Key)

### Langkah Pemasangan

1.  **Clone Repositori**:
    ```bash
    git clone https://github.com/username/saku-smart-expense-tracker.git
    cd saku-smart-expense-tracker
    ```

2.  **Instalasi Dependensi**:
    Gunakan pnpm untuk menginstal semua library frontend dan backend di root direktori monorepo:
    ```bash
    pnpm install
    ```

3.  **Konfigurasi Variabel Lingkungan**:
    *   Buat file `.env` di dalam folder **`backend/`** (contoh isi lihat di `backend/.env.example`).
    *   Buat file `.env` di dalam folder **`frontend/`** (contoh isi lihat di `frontend/.env.example`).

4.  **Migrasi & Seed Database**:
    Jalankan perintah berikut untuk menginisialisasi skema tabel dan mengisi data awal (*seed* kategori):
    ```bash
    # Masuk ke folder backend
    cd backend
    
    # Generate Prisma Client
    pnpm db:generate
    
    # Jalankan migrasi tabel ke PostgreSQL Anda
    pnpm db:migrate
    
    # Jalankan seeder database
    pnpm db:seed
    
    # Kembali ke root
    cd ..
    ```

5.  **Jalankan Mode Pengembangan (Development)**:
    Kembali ke root direktori dan jalankan skrip pnpm workspace secara bersamaan:
    ```bash
    pnpm dev
    ```
    *   Frontend akan berjalan di: `http://localhost:5173`
    *   Backend API akan berjalan di: `http://localhost:5001`

---

## 🐋 Panduan Menjalankan dengan Docker Compose

Untuk deployment skala produksi ke server VPS secara instan menggunakan Docker, kami telah menyertakan konfigurasi Docker terpadu di root direktori.

### Langkah-langkah Deployment:

1.  **Konfigurasi Berkas Env Root**:
    Salin template `.env.example` di root direktori menjadi `.env`:
    ```bash
    cp .env.example .env
    ```
    Buka file `.env` tersebut dan sesuaikan isinya dengan kredensial PostgreSQL, API Keys Google Gemini, API Keys Cloudinary, serta alamat IP/Domain VPS Anda.

2.  **Jalankan Docker Compose**:
    Jalankan perintah berikut untuk mengunduh image, melakukan build, dan menjalankan kontainer di latar belakang (*detached mode*):
    ```bash
    docker compose up -d --build
    ```

3.  **Verifikasi Berjalan**:
    *   Aplikasi Frontend dapat diakses di: `http://<domain-atau-ip-vps>` (Port `80`)
    *   Backend API dapat diakses di: `http://<domain-atau-ip-vps>:5001`
    *   Database PostgreSQL berjalan internal dan mengekspos port `5432` untuk eksternal.

4.  **Melihat Log Kontainer**:
    Jika ingin memantau log aplikasi atau database saat berjalan:
    ```bash
    docker compose logs -f
    ```

5.  **Mematikan Layanan**:
    ```bash
    docker compose down
    ```
