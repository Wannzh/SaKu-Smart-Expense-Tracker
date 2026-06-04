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
} from "lucide-react";
import clsx from "clsx";
import { formatRelativeDate } from "../utils/format";

// ─── Session Sidebar ────────────────────────────────────────
const SessionList = memo(function SessionList({ sessions, activeId, onSelect, onCreate, onDelete, isLoading }) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-[var(--border-color)] bg-[var(--sidebar-bg)]">
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">Riwayat Chat</h2>
        <button onClick={onCreate} className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer" title="Chat Baru">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-tertiary)]" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="flex flex-col py-1">
            {sessions.map((s) => (
              <div key={s.id} onClick={() => onSelect(s.id)}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-150",
                  activeId === s.id ? "bg-indigo-50 dark:bg-indigo-950/30 border-r-2 border-indigo-600" : "hover:bg-[var(--bg-tertiary)]"
                )}>
                <div className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", activeId === s.id ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]")}>
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={clsx("truncate text-sm font-medium", activeId === s.id ? "text-indigo-700 dark:text-indigo-300" : "text-[var(--text-primary)]")}>{s.title || "Chat Baru"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[11px] text-[var(--text-tertiary)]">{formatRelativeDate(s.createdAt)}</p>
                    {s._count?.messages > 0 && (
                      <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] rounded-full px-1.5 py-0.5 tabular-nums">
                        {s._count.messages}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-all cursor-pointer" title="Hapus sesi">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Bot className="h-10 w-10 text-[var(--text-tertiary)] mb-3" />
            <p className="text-xs text-[var(--text-tertiary)]">Belum ada riwayat chat</p>
            <p className="text-[11px] text-[var(--text-tertiary)] mt-1">Tap + untuk mulai chat baru</p>
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
    <div className="border-t border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3">
      <div className="flex items-end gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-tertiary)] px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <textarea ref={textareaRef} value={text} onChange={handleInput} onKeyDown={handleKeyDown}
          placeholder="Tanya seputar keuangan..."
          rows={1} className="flex-1 resize-none bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none" style={{ maxHeight: "120px" }} />
        <button onClick={handleSend} disabled={!text.trim() || isSending}
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer",
            text.trim() && !isSending ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" : "bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] cursor-not-allowed"
          )}>
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5 text-center">Enter untuk kirim • Shift+Enter baris baru</p>
    </div>
  );
});

// ─── Empty Chat ─────────────────────────────────────────────
const EmptyChat = memo(function EmptyChat({ onCreate }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 to-amber-50 dark:from-indigo-900/30 dark:to-amber-900/20 mb-5">
        <Wallet className="h-9 w-9 text-indigo-600" />
      </div>
      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">SaKu AI Assistant</h3>
      <p className="text-sm text-[var(--text-tertiary)] mb-6 max-w-sm">Tanya apa saja seputar keuangan personal — analisis pengeluaran, tips menabung, dan banyak lagi.</p>
      <button onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-indigo-200/50 dark:hover:shadow-indigo-900/50 transition-all cursor-pointer">
        <Plus className="h-4 w-4" />
        Mulai Chat Baru
      </button>
    </div>
  );
});

// ─── Main ───────────────────────────────────────────────────
const ChatPage = memo(function ChatPage() {
  const { sessions, activeSession, messages, isLoading, isSending, getSessions, createSession, getSession, sendMessage, deleteSession } = useChat();

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
    <div className="flex h-screen -m-6 overflow-hidden">
      <SessionList sessions={sessions} activeId={activeSession?.id} onSelect={handleSelectSession} onCreate={handleCreateSession} onDelete={handleDeleteSession} isLoading={isLoading} />

      <div className="flex flex-1 flex-col bg-[var(--bg-primary)]">
        {activeSession ? (
          <>
            <div className="flex items-center gap-3 border-b border-[var(--border-color)] bg-[var(--card-bg)] px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 text-amber-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">{activeSession.title || "Chat Baru"}</h3>
                <p className="text-[11px] text-[var(--text-tertiary)]">SaKu AI Assistant</p>
              </div>
            </div>

            <ChatWindow messages={messages} isLoading={isSending} />
            <ChatInput onSend={handleSendMessage} isSending={isSending} />
          </>
        ) : (
          <EmptyChat onCreate={handleCreateSession} />
        )}
      </div>
    </div>
  );
});

export default ChatPage;
