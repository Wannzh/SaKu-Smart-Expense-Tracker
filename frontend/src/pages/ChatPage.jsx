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

// ─── Sidebar Sesi ───────────────────────────────────────────
const SessionList = memo(function SessionList({
  sessions,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  isLoading,
}) {
  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">Riwayat Chat</h2>
        <button
          onClick={onCreate}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          title="Chat Baru"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && sessions.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
          </div>
        ) : sessions.length > 0 ? (
          <div className="flex flex-col py-2">
            {sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelect(s.id)}
                className={clsx(
                  "group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors",
                  activeId === s.id
                    ? "bg-indigo-50 border-r-2 border-indigo-600"
                    : "hover:bg-gray-50"
                )}
              >
                <div
                  className={clsx(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    activeId === s.id
                      ? "bg-indigo-100 text-indigo-600"
                      : "bg-gray-100 text-gray-400"
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={clsx(
                      "truncate text-sm font-medium",
                      activeId === s.id ? "text-indigo-700" : "text-gray-700"
                    )}
                  >
                    {s.title || "Chat Baru"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatRelativeDate(s.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
                  title="Hapus sesi"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Bot className="h-10 w-10 text-gray-200 mb-3" />
            <p className="text-xs text-gray-400">Belum ada riwayat chat</p>
            <p className="text-[11px] text-gray-300 mt-1">
              Tap + untuk mulai chat baru
            </p>
          </div>
        )}
      </div>
    </div>
  );
});

// ─── Input Bar ──────────────────────────────────────────────
const ChatInput = memo(function ChatInput({ onSend, isSending }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;
    onSend(trimmed);
    setText("");
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [text, isSending, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInput = useCallback((e) => {
    setText(e.target.value);
    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  }, []);

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Tanya seputar keuangan..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none"
          style={{ maxHeight: "120px" }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || isSending}
          className={clsx(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all cursor-pointer",
            text.trim() && !isSending
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {isSending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
});

// ─── Empty Chat Area ────────────────────────────────────────
const EmptyChat = memo(function EmptyChat({ onCreate }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center px-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 mb-5">
        <Wallet className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        SaKu AI Assistant
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-sm">
        Tanya apa saja seputar keuangan personal — analisis pengeluaran, tips menabung, dan banyak lagi.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors cursor-pointer"
      >
        <Plus className="h-4 w-4" />
        Mulai Chat Baru
      </button>
    </div>
  );
});

// ─── Main ChatPage ──────────────────────────────────────────
const ChatPage = memo(function ChatPage() {
  const {
    sessions,
    activeSession,
    messages,
    isLoading,
    isSending,
    getSessions,
    createSession,
    getSession,
    sendMessage,
    deleteSession,
  } = useChat();

  useEffect(() => {
    getSessions();
  }, [getSessions]);

  const handleSelectSession = useCallback(
    (id) => {
      if (activeSession?.id === id) return;
      getSession(id);
    },
    [activeSession, getSession]
  );

  const handleCreateSession = useCallback(async () => {
    await createSession();
  }, [createSession]);

  const handleSendMessage = useCallback(
    async (content) => {
      if (!activeSession) return;
      await sendMessage(activeSession.id, content);
    },
    [activeSession, sendMessage]
  );

  const handleDeleteSession = useCallback(
    async (id) => {
      await deleteSession(id);
    },
    [deleteSession]
  );

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6 rounded-none overflow-hidden">
      {/* Sidebar sesi */}
      <SessionList
        sessions={sessions}
        activeId={activeSession?.id}
        onSelect={handleSelectSession}
        onCreate={handleCreateSession}
        onDelete={handleDeleteSession}
        isLoading={isLoading}
      />

      {/* Chat area */}
      <div className="flex flex-1 flex-col bg-[#F9FAFB]">
        {activeSession ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-5 py-3.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {activeSession.title || "Chat Baru"}
                </h3>
                <p className="text-[11px] text-gray-400">SaKu AI Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <ChatWindow messages={messages} isLoading={isSending} />

            {/* Input */}
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
