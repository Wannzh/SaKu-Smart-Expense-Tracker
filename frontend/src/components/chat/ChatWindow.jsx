import { memo, useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";
import { Wallet } from "lucide-react";

const ChatWindow = memo(function ChatWindow({ messages, isLoading }) {
  const bottomRef = useRef(null);

  // Auto-scroll ke bawah saat pesan baru
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 bg-[var(--bg-primary)]">
      <div className="flex flex-col gap-4">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2.5 mr-auto max-w-[85%]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 mt-1">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-[var(--card-bg)] border border-[var(--border-color)] px-4 py-3 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--text-tertiary)] mr-1">SaKu sedang mengetik</span>
                <span className="flex gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-tertiary)] animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
});

export default ChatWindow;
