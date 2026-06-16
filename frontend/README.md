# 🖥️ SaKu — Frontend Client

> Bagian dari monorepo [SaKu - Smart Expense Tracker](../README.md)

Kode sumber aplikasi client-side **SaKu**. Dibangun menggunakan **React 19** dengan build-tool **Vite** dan menggunakan **Tailwind CSS** untuk antarmuka yang premium, dinamis, serta mendukung Dark Mode penuh.

---

## 🛠️ Tech Stack & Dependensi Utama

| Paket | Versi | Kegunaan |
|-------|-------|----------|
| React | v19 | UI Library |
| Vite | v8 | Build tool & dev server |
| React Router DOM | v7 | Client-side routing |
| Tailwind CSS | v4 | Utility-first styling |
| Axios | latest | HTTP client (cookie credentials & interceptors) |
| Recharts | latest | Visualisasi statistik data keuangan |
| Lucide React | latest | Library ikon modern |
| Day.js | latest | Manipulasi & format tanggal |
| React Hot Toast | latest | Notifikasi toast estetik |

---

## 📁 Struktur Direktori

```
frontend/
├── public/                # Static assets (favicon saku.svg, dll.)
├── src/
│   ├── api/               # Definisi endpoint REST API (auth, wallet, transactions, dll.)
│   ├── assets/            # Gambar dan banner statis pendukung
│   ├── components/
│   │   ├── common/        # Komponen dasar reusable (Button, Input, Modal, UserAvatar)
│   │   ├── layout/        # Tata letak (Sidebar, BottomNav, AppLayout)
│   │   └── transaction/   # Kartu & formulir transaksi
│   ├── context/           # Global State (AuthContext & ThemeContext)
│   ├── hooks/             # Custom React Hooks
│   ├── pages/             # Komponen halaman per-route
│   ├── routes/            # Konfigurasi rute & ProtectedRoute
│   ├── utils/             # Helper functions & formatter
│   ├── App.jsx            # Komponen root React
│   ├── index.css          # Sistem desain global, CSS Variables, animasi
│   └── main.jsx           # Entry point (ReactDOM.createRoot)
├── Dockerfile             # Multi-stage build Docker (Node build → Nginx serve)
├── nginx.conf             # Konfigurasi Nginx untuk produksi (SPA fallback)
└── package.json           # Dependensi & skrip pnpm frontend
```

---

## ⚙️ Variabel Lingkungan (.env)

Buat file `.env` di dalam folder ini berdasarkan template `.env.example`:

| Variabel | Contoh Nilai | Keterangan |
|----------|-------------|------------|
| `VITE_API_URL` | `http://localhost:5001/api` | Alamat base URL backend API |
| `VITE_GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Client ID Google OAuth |

---

## 🧩 Custom Hooks Khas SaKu

### `useMoneyInput`
Mengubah input teks nominal secara otomatis ke format ribuan rupiah Indonesia.
- Mengetik `1000000` → tampil `1.000.000`
- Nilai yang dikirim ke API tetap berupa angka asli `1000000`

### `useTheme`
Menyinkronkan seluruh preferensi tampilan secara global di semua halaman:
- Tema warna: `light` | `dark` | `system`
- Skema gradasi kartu bento dompet
- Visibilitas saldo (`showBalance`) — toggle satu klik menyembunyikan semua nominal

### `useWallet`
Fetching & caching data dompet aktif pengguna untuk digunakan di berbagai halaman secara konsisten.

---

## 🏃 Skrip yang Tersedia (pnpm)

Jalankan dari dalam folder `frontend/` atau dari root workspace dengan filter `--filter frontend`:

```bash
# Mode pengembangan (hot reload)
pnpm dev

# Build produksi ke dist/
pnpm build

# Preview hasil build lokal
pnpm preview

# Linting kode (ESLint)
pnpm lint
```
