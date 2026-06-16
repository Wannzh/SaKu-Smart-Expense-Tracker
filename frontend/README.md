# 🖥️ SaKu - Frontend Client

Bagian ini berisi kode sumber aplikasi client-side **SaKu (Smart Expense Tracker)**. Dibangun menggunakan **React** dengan build-tool **Vite** dan dihiasi dengan **Tailwind CSS** untuk menciptakan antarmuka pengguna yang premium, dinamis, serta mendukung Dark Mode secara penuh.

---

## 🛠️ Tech Stack & Dependensi Utama

*   **Runtime & Compiler**: React (v19), Vite (v8), Babel
*   **Routing**: React Router DOM (v7)
*   **Styling**: Tailwind CSS & Vanilla CSS Variables (untuk Glassmorphism dan tema responsif)
*   **Icons**: Lucide React
*   **HTTP Client**: Axios (dengan interceptors untuk otomatisasi pengiriman token JWT via cookie/kredensial)
*   **Charts**: Recharts (untuk pelaporan data statistik visual)
*   **Lain-lain**: Day.js (pustaka manipulasi tanggal lokal), React Hot Toast (untuk feedback toast notifikasi yang estetik)

---

## 📁 Struktur Direktori

```
frontend/
├── public/                # Static assets (logo, SVG, dll.)
├── src/
│   ├── api/               # Endpoint REST API (auth, wallet, transactions, dll.)
│   ├── assets/            # Gambar dan banner statis pendukung
│   ├── components/        # Komponen React reusable
│   │   ├── common/        # Komponen dasar (Button, Input, Modal, UserAvatar)
│   │   ├── layout/        # Komponen tata letak (Sidebar, BottomNav, AppLayout)
│   │   └── transaction/   # Kartu transaksi dan formulir transaksi
│   ├── context/           # Global State Context (AuthContext & ThemeContext)
│   ├── hooks/             # Custom React Hooks (useWallet, useTheme, useMoneyInput)
│   ├── pages/             # Komponen halaman router (Dashboard, Wallet, dll.)
│   ├── routes/            # Konfigurasi perutean & ProtectedRoute
│   ├── utils/             # Fungsi helper & format data kustom
│   ├── App.jsx            # Entrypoint komponen utama React
│   ├── index.css          # Desain sistem global CSS, CSS Variables, dan animasi
│   └── main.jsx           # Root mounter komponen React
├── Dockerfile             # Konfigurasi multi-stage build Docker
├── nginx.conf             # Konfigurasi reverse proxy Nginx produksi
└── package.json           # Dependensi & skrip pnpm frontend
```

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di dalam folder ini berdasarkan template `.env.example`:

*   `VITE_API_URL`: Alamat API backend Anda (lokal: `http://localhost:5001/api`).
*   `VITE_GOOGLE_CLIENT_ID`: ID Client OAuth dari Google Cloud Console (untuk fitur Google login).

---

## 📝 Custom Hooks Khas SaKu

*   **`useMoneyInput`**: Mengubah input teks nominal secara instan ke format ribuan rupiah Indonesia (misal: mengetik `1000000` otomatis ditampilkan menjadi `1.000.000` di antarmuka, tetapi tetap mengirim nilai `1000000` berupa angka asli ke database).
*   **`useTheme`**: Menyinkronkan tema warna (*light*, *dark*, atau *system*), skema gradasi kartu bento, serta visibilitas saldo (`showBalance`) secara global di seluruh aplikasi.

---

## 🏃 Skrip yang Tersedia (pnpm)

Dari dalam folder `frontend/` atau menggunakan filter dari root workspace:

*   **Menjalankan Mode Pengembangan**:
    ```bash
    pnpm dev
    ```
*   **Kompilasi Produksi**:
    ```bash
    pnpm build
    ```
*   **Melihat Pratinjau Hasil Build**:
    ```bash
    pnpm preview
    ```
*   **Linting Kode**:
    ```bash
    pnpm lint
    ```
