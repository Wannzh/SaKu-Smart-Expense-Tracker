import { memo, useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "../hooks/useChat";
import { useNavigate } from "react-router-dom";
import ChatWindow from "../components/chat/ChatWindow";
import scanReceiptBanner from "../assets/scan_receipt_banner.png";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Bot,
  Loader2,
  Menu,
  X,
  TrendingUp,
  Receipt,
  PiggyBank,
  PlusCircle,
  Image as ImageIcon,
  Search,
  MoreVertical
} from "lucide-react";
import clsx from "clsx";
import { formatRelativeDate } from "../utils/format";

const SuggestedChips = memo(function SuggestedChips({ chips, onChipClick, disabled }) {
  if (!chips || chips.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 justify-center py-3 bg-[var(--bg-primary)] select-none">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => !disabled && onChipClick(chip)}
          disabled={disabled}
          className="px-4 py-1.5 bg-[var(--bg-secondary)] hover:bg-indigo-50 dark:hover:bg-indigo-950/25 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full text-xs font-semibold border border-[var(--border-color)]/60 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {chip}
        </button>
      ))}
    </div>
  );
});

// ─── Session Sidebar (Desktop & Mobile Drawer Support) ─────────────────
const SessionList = memo(function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, isLoading, isOpenMobile, onCloseMobile }) {
  return (
    <div className={clsx(
      "h-full w-[280px] shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--bg-secondary)] z-30 transition-transform duration-300",
      "fixed inset-y-0 left-0 lg:static lg:translate-x-0 flex",
      isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      {/* Header */}
      <div className="p-5 border-b border-[var(--border-color)]/60 flex justify-between items-center select-none bg-[var(--bg-secondary)]">
        <h2 className="text-base font-bold text-[var(--text-primary)]">Riwayat Chat</h2>
        <div className="flex items-center gap-1.5">
          <button onClick={onCreate} className="p-2 hover:bg-[var(--bg-tertiary)] rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors cursor-pointer" title="Chat Baru">
            <Plus className="h-4.5 w-4.5" />
          </button>
          {/* Tombol Close Drawer khusus Mobile */}
          <button onClick={onCloseMobile} className="p-2 lg:hidden hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-lg cursor-pointer" title="Tutup">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Sessions Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-[var(--bg-secondary)]">
        {isLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => {
              const isActive = activeId === s.id;
              return (
                <div key={s.id} 
                  onClick={() => {
                    onSelect(s.id);
                    onCloseMobile();
                  }}
                  className={clsx(
                    "group p-4 rounded-xl cursor-pointer transition-all duration-200 border relative",
                    isActive 
                      ? "bg-[var(--bg-primary)] border-indigo-600/30 shadow-xs" 
                      : "border-transparent hover:bg-[var(--bg-primary)]/80"
                  )}>
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className={clsx(
                      "font-semibold text-sm truncate flex-1 text-left",
                      isActive ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-[var(--text-primary)]"
                    )}>
                      {s.title || "Chat Baru"}
                    </span>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 font-medium">
                      {formatRelativeDate(s.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-xs text-[var(--text-secondary)] truncate flex-1 pr-4 text-left">
                      {s.title ? "Konsultasi finansial SaKu AI..." : "Mulai percakapan baru..."}
                    </p>
                    
                    {s._count?.messages > 0 && (
                      <span className={clsx(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-bold tabular-nums shrink-0",
                        isActive ? "bg-indigo-600 text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]"
                      )}>
                        {s._count.messages}
                      </span>
                    )}
                  </div>
                  {/* Delete button absolute right corner to hover cleaner */}
                  <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-all cursor-pointer bg-[var(--bg-primary)]" title="Hapus sesi">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none">
            <Bot className="h-10 w-10 text-[var(--text-tertiary)] mb-3 opacity-40 animate-pulse" />
            <p className="text-xs font-bold text-[var(--text-secondary)]">Belum ada riwayat chat</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-relaxed">Tekan ikon tambah untuk mulai konsultasi baru</p>
          </div>
        )}

        {/* Empty State / Archived Visual Cue from mockup */}
        {sessions.length > 0 && (
          <div className="mt-8 flex flex-col items-center opacity-40 px-6 py-4 text-center select-none">
            <Bot className="h-8 w-8 text-[var(--text-tertiary)] mb-2" />
            <p className="text-[10px] text-[var(--text-tertiary)] leading-relaxed font-medium">Chat lama diarsipkan otomatis setelah 30 hari</p>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Chat Input ─────────────────────────────────────────────
const ChatInput = memo(function ChatInput({ onSend, isSending }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [text, isSending, onSend]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  const handleInput = useCallback((e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }, []);

  return (
    <footer className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]/60 select-none">
      <div className="max-w-4xl mx-auto flex items-end gap-3 bg-[var(--bg-primary)] rounded-2xl p-2 border border-[var(--border-color)]/60 focus-within:border-indigo-500 transition-colors">
        <div className="flex gap-0.5 mb-1">
          <button type="button" className="p-2 text-[var(--text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Tambah Lampiran">
            <PlusCircle className="h-5 w-5" />
          </button>
          <button type="button" className="p-2 text-[var(--text-tertiary)] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer" title="Kirim Gambar">
            <ImageIcon className="h-5 w-5" />
          </button>
        </div>
        <textarea ref={textareaRef} value={text} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder="Tanyakan sesuatu pada SaKu AI..."
          rows={1} className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none min-h-[40px] focus:outline-none" style={{ maxHeight: "120px" }} />
        <button onClick={handleSend} disabled={!text.trim() || isSending}
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md shrink-0 mb-0.5",
            text.trim() && !isSending 
              ? "bg-indigo-600 text-white hover:brightness-110 shadow-indigo-600/20 active:scale-95 cursor-pointer" 
              : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed shadow-none"
          )}>
          {isSending ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Send className="h-4.5 w-4.5" />}
        </button>
      </div>
      <div className="text-center mt-2.5">
        <p className="text-[10px] text-[var(--text-tertiary)]">SaKu AI dapat membuat kesalahan. Harap verifikasi info penting.</p>
      </div>
    </footer>
  );
});

// ─── Empty Chat ─────────────────────────────────────────────
const EmptyChat = memo(function EmptyChat({ onCreate, onOpenMenuMobile }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-6 py-12 bg-[var(--bg-primary)]">
      {/* Tombol Khusus Mobile di layar kosong agar user sadar ada menu riwayat */}
      <button onClick={onOpenMenuMobile} className="lg:hidden mb-6 flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)]/60 bg-[var(--bg-secondary)] rounded-xl text-xs text-[var(--text-secondary)] font-bold cursor-pointer shadow-xs">
        <Menu className="h-3.5 w-3.5" />
        Lihat Riwayat Chat
      </button>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-indigo-500/5 text-indigo-600 dark:text-indigo-400 mb-4 shadow-xs border border-indigo-500/10">
        <Bot className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-[var(--text-primary)]">SaKu AI Assistant</h3>
      <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed font-medium mt-1">
        Konsultasikan catatan keuangan personal Anda — peroleh analisis pengeluaran otomatis, tips menabung terarah, serta evaluasi anggaran cerdas.
      </p>
      <button onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition-all cursor-pointer active:scale-95">
        <Plus className="h-4 w-4" />
        Mulai Konsultasi Baru
      </button>
    </div>
  );
});

// ─── Main Component ─────────────────────────────────────────
const ChatPage = memo(function ChatPage() {
  const { sessions, activeSession, messages, isLoading, isSending, getSessions, createSession, getSession, sendMessage, deleteSession } = useChat();
  const navigate = useNavigate();
  
  // State untuk kontrol Drawer Riwayat Chat di Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { getSessions(); }, [getSessions]);

  const handleSelectSession = useCallback((id) => {
    if (activeSession?.id === id) return;
    getSession(id);
  }, [activeSession, getSession]);

  const handleCreateSession = useCallback(async () => { await createSession(); }, [createSession]);
  
  const handleSendMessage = useCallback(async (content) => {
    if (!activeSession) return;
    await sendMessage(activeSession.id, content);
  }, [activeSession, sendMessage]);

  const handleDeleteSession = useCallback(async (id) => { await deleteSession(id); }, [deleteSession]);

  const handleChipClick = useCallback(async (chipText) => {
    if (!activeSession || isSending) return;
    await sendMessage(activeSession.id, chipText);
  }, [activeSession, sendMessage, isSending]);

  const handleCapabilityClick = useCallback(async (promptText) => {
    if (isSending) return;
    let targetSession = activeSession;
    if (!targetSession) {
      targetSession = await createSession();
    }
    if (targetSession) {
      await sendMessage(targetSession.id, promptText);
    }
  }, [activeSession, createSession, sendMessage, isSending]);

  return (
    <div className="flex h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-3rem)] border border-[var(--border-color)]/60 bg-[var(--card-bg)] rounded-3xl overflow-hidden relative shadow-xs">
      
      {/* Backdrop overlay saat drawer mobile terbuka */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 lg:hidden" />
      )}

      {/* Sesi List dengan dukungan Drawer responsif */}
      <SessionList 
        sessions={sessions} 
        activeId={activeSession?.id} 
        onSelect={handleSelectSession} 
        onCreate={handleCreateSession} 
        onDelete={handleDeleteSession} 
        isLoading={isLoading} 
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Jendela Obrolan Utama */}
      <div className="flex flex-1 flex-col bg-[var(--bg-primary)] min-w-0 border-r border-[var(--border-color)]/60 last:border-r-0">
        {activeSession ? (
          <>
            {/* Header Sesi */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/60 bg-[var(--bg-secondary)] px-6 py-4 select-none">
              <div className="flex items-center gap-3 min-w-0">
                {/* Tombol Pemicu Menu Riwayat (Hanya Muncul di Mobile) */}
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] lg:hidden cursor-pointer" title="Menu Riwayat">
                  <Menu className="h-5 w-5" />
                </button>

                <div className="w-12 h-12 bg-[#ffc329]/15 border border-[#ffc329]/30 rounded-2xl flex items-center justify-center text-[#6f5100] dark:text-[#f9bd22] shadow-sm shrink-0">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{activeSession.title || "Chat Baru"}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></span>
                    <span className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider leading-none">Aktif & Siap membantu</span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-1 select-none">
                <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] transition-colors cursor-pointer" title="Cari pesan">
                  <Search className="h-4.5 w-4.5" />
                </button>
                <button className="p-2 hover:bg-[var(--bg-tertiary)] rounded-xl text-[var(--text-secondary)] transition-colors cursor-pointer" title="Lainnya">
                  <MoreVertical className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            {/* Area Pesan & Kolom Input */}
            <ChatWindow messages={messages} isLoading={isSending} />
            <ChatInput onSend={handleSendMessage} isSending={isSending} />
          </>
        ) : (
          <EmptyChat onCreate={handleCreateSession} onOpenMenuMobile={() => setIsMobileMenuOpen(true)} />
        )}
      </div>

      {/* Panel Asisten Kanan: Capabilities & Promo */}
      <aside className="w-[320px] bg-[var(--bg-secondary)] p-6 space-y-6 hidden xl:block overflow-y-auto custom-scrollbar shrink-0 select-none border-l border-[var(--border-color)]/60 text-left">
        <h4 className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest leading-none mb-4">Apa yang bisa saya bantu?</h4>
        <div className="space-y-4">
          
          {/* Card: Analisis Keuangan */}
          <div onClick={() => handleCapabilityClick("Tolong bantu saya menganalisis pola pengeluaran keuangan bulanan saya.")}
            className="group p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]/50 hover:border-indigo-500/50 hover:shadow-xs transition-all cursor-pointer">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-3">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h5 className="font-bold text-sm text-[var(--text-primary)]">Analisis Keuangan</h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">Minta analisis pola pengeluaran bulanan atau tips menghemat dana finansial.</p>
          </div>

          {/* Card: Perencanaan Anggaran */}
          <div onClick={() => handleCapabilityClick("Bagaimana cara menyusun anggaran bulanan yang efektif di SaKu?")}
            className="group p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]/50 hover:border-indigo-500/50 hover:shadow-xs transition-all cursor-pointer">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-3">
              <PiggyBank className="h-5 w-5" />
            </div>
            <h5 className="font-bold text-sm text-[var(--text-primary)]">Perencanaan Anggaran</h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">Konsultasikan cara menyusun anggaran bulanan yang efektif untuk tabungan Anda.</p>
          </div>

          {/* Card: Panduan Fitur SaKu */}
          <div onClick={() => handleCapabilityClick("Bagaimana cara menggunakan fitur pencatatan transaksi, scan struk, dan kelola dompet di SaKu?")}
            className="group p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]/50 hover:border-indigo-500/50 hover:shadow-xs transition-all cursor-pointer">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-3">
              <Receipt className="h-5 w-5" />
            </div>
            <h5 className="font-bold text-sm text-[var(--text-primary)]">Panduan Fitur SaKu</h5>
            <p className="text-xs text-[var(--text-secondary)] mt-1.5 leading-relaxed font-medium">Tanyakan cara mencatat transaksi, scan struk otomatis, atau kelola dompet.</p>
          </div>

        </div>

        {/* Fitur Unggulan Space */}
        <div className="relative mt-8 rounded-3xl overflow-hidden aspect-[4/5] shadow-lg group">
          <img className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Scan Struk SaKu" src={scanReceiptBanner} />
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/95 via-indigo-900/40 to-transparent p-5 flex flex-col justify-end text-left animate-fade-slide-up">
            <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md self-start mb-2 select-none tracking-wider">FITUR UNGGULAN</span>
            <h4 className="text-white font-bold text-base leading-tight select-none">Pindai & Catat Transaksi Otomatis</h4>
            <p className="text-white/80 text-[11px] mt-1 select-none leading-relaxed">Cukup foto struk belanja Anda, dan AI SaKu akan mencatat nominal serta kategori secara instan.</p>
            <button onClick={() => navigate("/scan")} className="mt-4 w-full py-2.5 bg-white text-indigo-700 hover:bg-white/95 rounded-xl font-bold text-xs active:scale-[0.98] transition-all cursor-pointer">Coba Scan Struk</button>
          </div>
        </div>
      </aside>
    </div>
  );
});

export default ChatPage;