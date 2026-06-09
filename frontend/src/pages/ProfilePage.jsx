import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { updateProfile } from "../api/auth.api";
import { LIGHT_CARD_GRADIENTS, DARK_CARD_GRADIENTS } from "../utils/constants";
import * as LucideIcons from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";

const ProfilePage = memo(function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { theme, resolvedTheme, cardStyle, setTheme, setCardStyle } = useTheme();

  // Expanded toggles untuk kestabilan fungsionalitas di mobile view
  const [showTheme, setShowTheme] = useState(false);
  const [showCardStyle, setShowCardStyle] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial user avatar calculation
  const initialName = useMemo(() => {
    if (!user?.name) return "?";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  }, [user]);

  // Notifications permission state
  const [notificationGranted, setNotificationGranted] = useState(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    return Notification.permission === "granted";
  });

  useEffect(() => {
    if (user?.name) {
      setEditName(user.name);
    }
  }, [user]);

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
      const res = await updateProfile({ name: editName });
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
    <div className="w-full max-w-5xl mx-auto animate-fade-slide-up">
      
      {/* HEADER UTAMA — Khusus Desktop agar menyatu dengan gaya layout dasbor */}
      <div className="py-4 border-b border-[var(--border-color)] mb-6 hidden lg:block select-none">
        <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Profil & Pengaturan</h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">Konfigurasi identitas personal dan preferensi visual antarmuka sistem SaKu.</p>
      </div>

      {/* TWO COLUMN GRID — Otomatis 1 kolom di Mobile, 12-kolom di Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= AREA KIRI: BIO HERO CARD ================= */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 space-y-4">
          <div className="flex flex-col items-center justify-center py-8 px-4 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-xs relative text-center">
            <div className="relative group mb-3 select-none">
              <div className="h-20 w-20 rounded-full bg-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                {initialName}
              </div>
              <button
                onClick={() => setIsEditOpen(true)}
                className="absolute bottom-0 right-0 h-6.5 w-6.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow border-2 border-[var(--card-bg)] active:scale-95 transition-all"
                title="Edit Profil"
              >
                <LucideIcons.Edit2 className="h-3 w-3" />
              </button>
            </div>

            <h2 className="text-base font-black text-[var(--text-primary)] leading-snug truncate max-w-full px-2">
              {user?.name || "User SaKu"}
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5 font-medium">
              {user?.email || "email@saku.com"}
            </p>

            {/* Tombol aksi modifikasi nama — Sangat berguna di desktop karena memotong barrier klik */}
            <div className="w-full border-t border-[var(--border-color)]/60 mt-5 pt-4 hidden lg:block">
              <button
                onClick={() => setIsEditOpen(true)}
                className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold bg-[var(--bg-tertiary)] hover:bg-[var(--border-color)] text-[var(--text-primary)] rounded-xl transition-all cursor-pointer"
              >
                <LucideIcons.UserCheck className="h-3.5 w-3.5 text-indigo-500" />
                <span>Ubah Nama Profil</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= AREA KANAN: GUGUS PANEL PENGATURAN UTUH ================= */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* GRUP AKUN */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-1 mb-2">
              Akun
            </p>
            <div className="bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
              <div
                onClick={() => navigate("/export")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-indigo-500">
                  <LucideIcons.Download className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Ekspor Data
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>

              <div
                onClick={() => navigate("/wallets")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-emerald-500">
                  <LucideIcons.Wallet className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Pengaturan Dompet
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>

              <div
                onClick={() => navigate("/categories")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-amber-500">
                  <LucideIcons.Tag className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Kategori
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>

              <div
                onClick={() => navigate("/budget")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-orange-500">
                  <LucideIcons.PieChart className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Anggaran
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>
            </div>
          </div>

          {/* GRUP PREFERENSI TAMPILAN */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-1 mb-2">
              Preferensi Visual
            </p>
            <div className="bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
              
              {/* Row Tema — Modul Akordion dipertahankan penuh demi konsistensi fungsional */}
              <div
                onClick={() => setShowTheme(!showTheme)}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-indigo-500">
                  {theme === "dark" ? (
                    <LucideIcons.Moon className="h-4 w-4" />
                  ) : (
                    <LucideIcons.Sun className="h-4 w-4" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Tema Lingkungan
                </span>
                <span className="text-xs text-[var(--text-tertiary)] font-bold capitalize mr-1">
                  {theme === "light" ? "Terang" : theme === "dark" ? "Gelap" : "Sistem"}
                </span>
                <LucideIcons.ChevronRight
                  className={clsx(
                    "h-4 w-4 text-[var(--text-tertiary)] transition-transform duration-200",
                    showTheme && "rotate-90"
                  )}
                />
              </div>

              {/* Theme Selector Drawer */}
              {showTheme && (
                <div className="px-4 pb-4 pt-1 bg-[var(--card-bg)] border-b border-[var(--border-color)] animate-fade-in flex gap-2 justify-between">
                  {["light", "dark", "system"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={clsx(
                        "flex-1 py-2 text-xs font-black rounded-xl border transition-all cursor-pointer mt-2 text-center",
                        theme === t
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                          : "bg-[var(--bg-primary)] border-[var(--border-color)]/60 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {t === "light" ? "Terang" : t === "dark" ? "Gelap" : "Sistem"}
                    </button>
                  ))}
                </div>
              )}

              {/* Row Desain Kartu */}
              <div
                onClick={() => setShowCardStyle(!showCardStyle)}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-violet-500">
                  <LucideIcons.Palette className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Gaya Gradasi Kartu
                </span>
                <LucideIcons.ChevronRight
                  className={clsx(
                    "h-4 w-4 text-[var(--text-tertiary)] transition-transform duration-200",
                    showCardStyle && "rotate-90"
                  )}
                />
              </div>

              {/* CardStyle Selector Grid */}
              {showCardStyle && (
                <div className="px-4 pb-4 pt-3 bg-[var(--card-bg)] border-b border-[var(--border-color)] animate-fade-in">
                  <p className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 select-none">
                    Pilih Warna Dompet Utama Dashboard
                  </p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {(resolvedTheme === "dark" ? DARK_CARD_GRADIENTS : LIGHT_CARD_GRADIENTS).map((grad, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCardStyle(idx)}
                        style={{
                          background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                        }}
                        className={clsx(
                          "h-9 rounded-xl cursor-pointer relative transition-all active:scale-95 flex items-center justify-center text-white border-2",
                          cardStyle === idx ? "border-indigo-600 dark:border-white scale-102 shadow-xs" : "border-transparent opacity-80 hover:opacity-100"
                        )}
                        title={grad.name}
                  >
                        {cardStyle === idx && <LucideIcons.Check className="h-4 w-4 drop-shadow-md" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Row Sistem Peringatan Notifikasi */}
              <div
                onClick={toggleNotifications}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-emerald-500">
                  <LucideIcons.Bell className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Notifikasi Sistem
                </span>
                <div
                  className={clsx(
                    "w-9 h-5.5 flex items-center rounded-full p-0.5 transition-colors duration-300",
                    notificationGranted ? "bg-indigo-600" : "bg-[var(--border-color)]"
                  )}
                >
                  <div
                    className={clsx(
                      "bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-300",
                      notificationGranted ? "translate-x-3.5" : "translate-x-0"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GRUP UMUM */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-1 mb-2">
              Umum
            </p>
            <div className="bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
              <div
                onClick={() => navigate("/about")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-blue-500">
                  <LucideIcons.Info className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Tentang SaKu
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>

              <div
                onClick={() => navigate("/feedback")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-purple-500">
                  <LucideIcons.MessageSquare className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Kirim Masukan
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>

              <div
                onClick={() => navigate("/bug-report")}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-red-500">
                  <LucideIcons.AlertCircle className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">
                  Lapor Bug
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>
            </div>
          </div>

          {/* GRUP SECURITY DATA & LOGOUT */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] px-1 mb-2">
              Manajemen Sistem & Sesi
            </p>
            <div className="bg-[var(--card-bg)] rounded-2xl overflow-hidden border border-[var(--border-color)]">
              
              {/* Reset Data */}
              <div
                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0 text-red-500">
                  <LucideIcons.Trash2 className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-red-500">
                  Hapus Semua Data
                </span>
                <LucideIcons.ChevronRight
                  className={clsx(
                    "h-4 w-4 text-[var(--text-tertiary)] transition-transform duration-200",
                    showDeleteConfirm && "rotate-90"
                  )}
                />
              </div>

              {/* Box Expand Konfirmasi Hapus */}
              {showDeleteConfirm && (
                <div className="px-4 pb-4 pt-3 bg-[var(--card-bg)] border-b border-[var(--border-color)] animate-fade-in">
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl space-y-3">
                    <p className="text-xs font-semibold text-red-500">
                      Yakin? Semua transaksi akan dihapus permanen.
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-1.5 text-xs font-bold bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          toast("Fitur segera hadir! 🚀");
                          setShowDeleteConfirm(false);
                        }}
                        className="flex-1 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Ya, Hapus
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Row Keluar Sesi — Hanya tampil di Mobile Viewport (`lg:hidden`) */}
              {/* Ini sangat krusial karena di Desktop tombol keluar sudah standby secara permanen di komponen Sidebar Anda */}
              <div
                onClick={handleLogout}
                className="flex lg:hidden items-center gap-3 px-4 py-3.5 border-b border-[var(--border-color)] last:border-0 cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors text-red-500"
              >
                <div className="flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[var(--bg-tertiary)] shrink-0">
                  <LucideIcons.LogOut className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium">
                  Keluar Akun
                </span>
                <LucideIcons.ChevronRight className="h-4 w-4 text-[var(--text-tertiary)]" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL EDIT PROFIL */}
      {isEditOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsEditOpen(false)} />
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
                  className="w-full rounded-xl border border-[var(--border-color)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none bg-[var(--bg-secondary)] focus:border-indigo-500 transition-all"
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