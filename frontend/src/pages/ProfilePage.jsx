import { memo, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { useTransaction } from "../hooks/useTransaction";
import { updateProfile } from "../api/auth.api";
import { LIGHT_CARD_GRADIENTS, DARK_CARD_GRADIENTS } from "../utils/constants";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

const ProfilePage = memo(function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { theme, resolvedTheme, cardStyle, setTheme, setCardStyle } = useTheme();
  const { transactions, getTransactions } = useTransaction();
  const avatarInputRef = useRef(null);

  // Expanded toggles for layout options
  const [showTheme, setShowTheme] = useState(false);
  const [showCardStyle, setShowCardStyle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Notifications permission state
  const [notificationGranted, setNotificationGranted] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    return Notification.permission === "granted";
  });

  // Fetch transactions on mount to get total count
  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  useEffect(() => {
    if (user?.name) {
      setEditName(user.name);
    }
  }, [user]);

  // Initial user initials calculation
  const initialName = useMemo(() => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [user]);

  // Member since date calculations
  const memberSince = useMemo(() => {
    if (!user?.createdAt) return "Jan 2023";
    try {
      const date = new Date(user.createdAt);
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      return "Jan 2023";
    }
  }, [user?.createdAt]);

  const toggleNotifications = async (e) => {
    e.stopPropagation(); 
    if (!("Notification" in window)) {
      toast.error("Browser Anda tidak mendukung notifikasi");
      return;
    }

    if (Notification.permission === "denied") {
      toast.error("Izin notifikasi diblokir browser. Silakan aktifkan di pengaturan browser Anda.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationGranted(permission === "granted");
    if (permission === "granted") {
      toast.success("Notifikasi diaktifkan! 🔔");
      try {
        new Notification("SaKu", { body: "Izin notifikasi berhasil diaktifkan!" });
      } catch (err) {
        console.warn("Unable to trigger Notification constructor", err);
      }
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", editName.trim());
      
      const res = await updateProfile(formData);
      setUser(res.data.data.user);
      toast.success("Profil berhasil diperbarui! ✅");
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    const loadToast = toast.loading("Mengunggah foto profil...");
    try {
      const res = await updateProfile(formData);
      setUser(res.data.data.user);
      toast.success("Foto profil berhasil diperbarui! ✅", { id: loadToast });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal mengunggah foto profil", { id: loadToast });
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error("Gagal melakukan logout");
    }
  }, [logout, navigate]);

  return (
    <div className="w-full max-w-[1280px] mx-auto animate-fade-slide-up">
      {/* Header Canvas */}
      <header className="mb-10 select-none">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">Pengaturan Profil</h2>
        <p className="text-base text-[var(--text-tertiary)] mt-1">Kelola akun dan preferensi aplikasi SaKu Anda</p>
      </header>

      {/* Two Column Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* ================= AREA KIRI: BIO HERO CARD ================= */}
        <section className="w-full lg:w-[35%] space-y-6">
          <div className="bg-[var(--card-bg)] p-8 rounded-3xl border border-[var(--border-color)]/60 shadow-sm relative overflow-hidden group">
            {/* Subtle Decorative Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <LucideIcons.Wallet className="w-[120px] h-[120px] text-[var(--text-primary)]" />
            </div>

            <div className="flex flex-col items-center text-center">
              {/* Profile Image & Uploader */}
              <div className="relative group mb-6 select-none">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-[var(--card-bg)] shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold text-3xl border-4 border-[var(--card-bg)] shadow-lg">
                    {initialName}
                  </div>
                )}
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-7 w-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center cursor-pointer shadow border-2 border-[var(--card-bg)] active:scale-95 transition-all"
                  title="Edit Foto Profil"
                >
                  <LucideIcons.Camera className="h-3.5 w-3.5" />
                </button>
              </div>

              <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-1">{user?.name || "Aris Darmawan"}</h3>
              <p className="text-sm text-[var(--text-tertiary)] mb-8">{user?.email || "aris.darmawan@fintech.com"}</p>
              
              <div className="w-full grid grid-cols-2 gap-4 py-6 border-t border-[var(--border-color)]/60">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Member Sejak</p>
                  <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{memberSince}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Total Transaksi</p>
                  <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{transactions?.length || 0}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditOpen(true)}
                className="mt-4 w-full border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-sm font-semibold py-3 rounded-xl transition-colors active:scale-[0.98] cursor-pointer"
              >
                Edit Profil
              </button>
            </div>
          </div>
        </section>

        {/* ================= AREA KANAN: GUGUS PANEL PENGATURAN UTUH ================= */}
        <section className="w-full lg:w-[65%] space-y-6">
          
          {/* Group: Akun */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]/60 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border-color)]/60 bg-[var(--bg-primary)]/50">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Akun</h3>
            </div>
            <div className="divide-y divide-[var(--border-color)]/60">
              {/* Ekspor Data */}
              <button 
                onClick={() => navigate("/export")}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                    <LucideIcons.Download className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[var(--text-primary)]">Ekspor Data</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Download semua riwayat dalam format CSV/PDF</p>
                  </div>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>

              {/* Manajemen Dompet */}
              <button 
                onClick={() => navigate("/wallets")}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                    <LucideIcons.Wallet className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[var(--text-primary)]">Manajemen Dompet</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Kelola rekening bank dan dompet digital terhubung</p>
                  </div>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>

              {/* Kategori Pengeluaran */}
              <button 
                onClick={() => navigate("/categories")}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                    <LucideIcons.Tag className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[var(--text-primary)]">Kategori Pengeluaran</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Kustom ikon dan warna untuk kategori budget</p>
                  </div>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>

          {/* Group: Preferensi */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]/60 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border-color)]/60 bg-[var(--bg-primary)]/50">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Preferensi</h3>
            </div>
            <div className="divide-y divide-[var(--border-color)]/60">
              
              {/* Tema Aplikasi */}
              <div className="px-8 py-5 flex flex-col">
                <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowTheme(!showTheme)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                      {theme === "dark" ? <LucideIcons.Moon className="h-5 w-5" /> : <LucideIcons.Sun className="h-5 w-5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-base font-semibold text-[var(--text-primary)]">Tema Aplikasi</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Ganti antara mode terang, gelap, atau sistem</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 capitalize bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg">
                      {theme === "light" ? "Terang" : theme === "dark" ? "Gelap" : "Sistem"}
                    </span>
                    <LucideIcons.ChevronDown className={clsx("h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-200", showTheme && "rotate-180")} />
                  </div>
                </div>
                {showTheme && (
                  <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--border-color)]/40 animate-fade-slide-up">
                    {["light", "dark", "system"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={clsx(
                          "flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center",
                          theme === t
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                            : "bg-[var(--bg-primary)] border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        )}
                      >
                        {t === "light" ? "Terang" : t === "dark" ? "Gelap" : "Sistem"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Warna Aksen (Gaya Gradasi Kartu) */}
              <div className="px-8 py-5 flex flex-col">
                <div className="flex items-center justify-between cursor-pointer group" onClick={() => setShowCardStyle(!showCardStyle)}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                      <LucideIcons.Palette className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-base font-semibold text-[var(--text-primary)]">Gaya Gradasi Kartu</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Pilih tema warna dompet utama dasbor Anda</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      style={{
                        background: `linear-gradient(135deg, ${(resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS)[cardStyle]?.from || "#3525cd"}, ${(resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS)[cardStyle]?.to || "#795900"})`
                      }}
                      className="w-8 h-8 rounded-lg shadow-sm border border-[var(--border-color)]/60"
                    />
                    <LucideIcons.ChevronDown className={clsx("h-5 w-5 text-[var(--text-tertiary)] transition-transform duration-200", showCardStyle && "rotate-180")} />
                  </div>
                </div>
                {showCardStyle && (
                  <div className="mt-4 pt-3 border-t border-[var(--border-color)]/40 animate-fade-slide-up">
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {(resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS).map((grad, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCardStyle(idx)}
                          style={{
                            background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                          }}
                          className={clsx(
                            "h-10 rounded-xl cursor-pointer relative transition-all active:scale-95 flex items-center justify-center text-white border-2",
                            cardStyle === idx ? "border-indigo-600 dark:border-white scale-102 shadow-sm" : "border-transparent opacity-85 hover:opacity-100"
                          )}
                          title={grad.name}
                        >
                          {cardStyle === idx && <LucideIcons.Check className="h-4 w-4 drop-shadow-md" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notifikasi Smart */}
              <div className="px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)]">
                    <LucideIcons.Bell className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[var(--text-primary)]">Notifikasi Smart</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Pengingat tagihan dan budget mingguan</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notificationGranted}
                    onChange={toggleNotifications}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Group: Umum */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]/60 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border-color)]/60 bg-[var(--bg-primary)]/50">
              <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Umum</h3>
            </div>
            <div className="divide-y divide-[var(--border-color)]/60">
              {/* Kirim Masukan */}
              <button 
                onClick={() => navigate("/feedback")}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                    <LucideIcons.MessageSquare className="h-5 w-5" />
                  </div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">Kirim Masukan</p>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>

              {/* Laporkan Bug */}
              <button 
                onClick={() => navigate("/bug-report")}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                    <LucideIcons.AlertTriangle className="h-5 w-5" />
                  </div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">Laporkan Bug</p>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>

              {/* About Page */}
              <button 
                onClick={() => navigate("/about")}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-indigo-600 transition-colors">
                    <LucideIcons.Info className="h-5 w-5" />
                  </div>
                  <p className="text-base font-semibold text-[var(--text-primary)]">Tentang SaKu</p>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>

          {/* Group: Data (Danger Zone) */}
          <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]/60 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border-color)]/60 bg-red-50/50 dark:bg-red-950/10">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">Zona Bahaya</h3>
            </div>
            <div className="divide-y divide-[var(--border-color)]/60">
              {/* Hapus Seluruh Data */}
              <div className="w-full">
                <button 
                  onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                  className="w-full px-8 py-4 flex items-center justify-between group hover:bg-red-50/40 dark:hover:bg-red-950/10 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-950/50 transition-colors">
                      <LucideIcons.Trash2 className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="text-base font-semibold text-red-600 dark:text-red-400">Hapus Seluruh Data</p>
                      <p className="text-xs text-[var(--text-tertiary)]">Tindakan ini permanen dan tidak bisa dibatalkan</p>
                    </div>
                  </div>
                  <LucideIcons.ChevronDown className={clsx("h-5 w-5 text-red-500 transition-transform duration-200", showDeleteConfirm && "rotate-180")} />
                </button>
                {showDeleteConfirm && (
                  <div className="px-8 pb-5 pt-1 bg-[var(--card-bg)] animate-fade-slide-up">
                    <div className="p-4 bg-red-500/10 dark:bg-red-950/20 border border-red-500/20 dark:border-red-500/30 rounded-2xl space-y-3">
                      <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                        Yakin? Semua tindakan ini permanen dan tidak bisa dibatalkan.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 py-2 text-xs font-bold bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl border border-[var(--border-color)]/60 cursor-pointer active:scale-95 transition-all"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            toast("Fitur segera hadir! 🚀");
                            setShowDeleteConfirm(false);
                          }}
                          className="flex-1 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors cursor-pointer active:scale-95 transition-all shadow-md"
                        >
                          Ya, Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Keluar dari Sesi */}
              <button 
                onClick={handleLogout}
                className="w-full px-8 py-4 flex items-center justify-between group hover:bg-[var(--bg-primary)] transition-colors text-left cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-red-500 transition-colors">
                    <LucideIcons.LogOut className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-[var(--text-primary)]">Keluar dari Sesi</p>
                    <p className="text-xs text-[var(--text-tertiary)]">Akhiri sesi aktif Anda di perangkat ini</p>
                  </div>
                </div>
                <LucideIcons.ChevronRight className="h-5 w-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditOpen(false)} />
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 w-full max-w-sm shadow-xl z-10 animate-fade-slide-up">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-4">Edit Profil</h3>
            <form onSubmit={handleEditProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Masukkan nama"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="flex-1 py-2 text-xs font-bold bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl transition-colors flex justify-center items-center gap-1 cursor-pointer"
                >
                  {isSubmitting ? (
                    <LucideIcons.Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});

export default ProfilePage;