import { memo, useState, useEffect, useCallback, useRef } from "react";
import { useChat } from "../hooks/useChat";
import ChatWindow from "../components/chat/ChatWindow";
import {
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Bot,
  Wallet,
  Loader2,
  Menu,
  X
} from "lucide-react";
import clsx from "clsx";
import { formatRelativeDate } from "../utils/format";

// ─── Session Sidebar (Desktop & Mobile Drawer Support) ─────────────────
const SessionList = memo(function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, isLoading, isOpenMobile, onCloseMobile }) {
  return (
    <div className={clsx(
      "h-full w-72 shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--card-bg)] lg:bg-[var(--bg-secondary)] z-30 transition-transform duration-300",
      // Responsive logic: Fixed Drawer di Mobile, Normal Flex Column di Desktop
      "fixed inset-y-0 left-0 lg:static lg:translate-x-0 flex",
      isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)] select-none">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Riwayat Chat</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onCreate} className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer" title="Chat Baru">
            <Plus className="h-4 w-4" />
          </button>
          {/* Tombol Close Drawer khusus Mobile */}
          <button onClick={onCloseMobile} className="flex h-8 w-8 lg:hidden items-center justify-center rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="flex flex-col py-1">
            {sessions.map((s) => (
              <div key={s.id} 
                onClick={() => {
                  onSelect(s.id);
                  onCloseMobile(); // Otomatis tutup panel riwayat di mobile setelah pilih chat
                }}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150 border-b border-[var(--border-color)]/30",
                  activeId === s.id ? "bg-indigo-500/10 dark:bg-indigo-500/5 border-r-4 border-indigo-600" : "hover:bg-[var(--bg-tertiary)]"
                )}>
                <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", activeId === s.id ? "bg-indigo-600 text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-secondary)]")}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={clsx("truncate text-sm font-bold", activeId === s.id ? "text-indigo-600 dark:text-indigo-400" : "text-[var(--text-primary)]")}>{s.title || "Chat Baru"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-[var(--text-tertiary)] font-medium">{formatRelativeDate(s.createdAt)}</p>
                    {s._count?.messages > 0 && (
                      <span className="text-[9px] text-[var(--text-secondary)] font-bold bg-[var(--bg-tertiary)] rounded-full px-1.5 py-0.2 tabular-nums">
                        {s._count.messages}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] lg:opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all cursor-pointer" title="Hapus sesi">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center select-none">
            <Bot className="h-10 w-10 text-[var(--text-tertiary)] mb-3 opacity-40" />
            <p className="text-xs font-bold text-[var(--text-secondary)]">Belum ada riwayat chat</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Tekan ikon tambah untuk mulai konsultasi baru</p>
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
    <div className="border-t border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 shrink-0">
      <div className="flex items-end gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
        <textarea ref={textareaRef} value={text} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder="Tanya seputar pengeluaran, anggaran, atau finansial..."
          rows={1} className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none py-1 min-h-[24px]" style={{ maxHeight: "120px" }} />
        <button onClick={handleSend} disabled={!text.trim() || isSending}
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer mb-0.5",
            text.trim() && !isSending ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
          )}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 text-center font-medium select-none">Enter untuk kirim • Shift+Enter baris baru</p>
    </div>
  );
});

// ─── Empty Chat ─────────────────────────────────────────────
const EmptyChat = memo(function EmptyChat({ onCreate, onOpenMenuMobile }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-6 py-12">
      {/* Tombol Khusus Mobile di layar kosong agar user sadar ada menu riwayat */}
      <button onClick={onOpenMenuMobile} className="lg:hidden mb-4 flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-color)] bg-[var(--card-bg)] rounded-xl text-xs text-[var(--text-secondary)] font-bold">
        <Menu className="h-3.5 w-3.5" />
        Lihat Riwayat Chat
      </button>

      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/20 dark:to-indigo-800/10 mb-4 shadow-xs">
        <Wallet className="h-7 w-7 text-indigo-600" />
      </div>
      <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tight">SaKu AI Assistant</h3>
      <p className="text-xs text-[var(--text-secondary)] mb-6 max-w-xs leading-relaxed font-medium">
        Konsultasikan catatan keuangan personal Anda — peroleh analisis pengeluaran otomatis, tips menabung terarah, serta evaluasi arus kas cerdas.
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

  return (
    /* PERBAIKAN TINGGI VISUAL CONTAINER UTAMA:
      Menggunakan tinggi absolut flex yang dihitung berdasarkan ruang bersih main layout,
      menghilangkan margin minus yang memicu kebocoran scrollbar.
    */
    <div className="flex h-[calc(100vh-8.5rem)] lg:h-[calc(100vh-3rem)] border border-[var(--border-color)] bg-[var(--card-bg)] rounded-3xl overflow-hidden relative">
      
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
      <div className="flex flex-1 flex-col bg-[var(--bg-primary)] min-w-0">
        {activeSession ? (
          <>
            {/* Header Sesi */}
            <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 select-none">
              <div className="flex items-center gap-3 min-w-0">
                {/* Tombol Pemicu Menu Riwayat (Hanya Muncul di Mobile) */}
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] lg:hidden cursor-pointer">
                  <Menu className="h-5 w-5" />
                </button>

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/10">
                  <Bot className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate">{activeSession.title || "Chat Baru"}</h3>
                  <p className="text-[10px] text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">SaKu Financial Expert AI</p>
                </div>
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
    </div>
  );
});

export default ChatPage;