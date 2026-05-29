import { memo, useMemo } from "react";
import { Wallet, User } from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";

/**
 * Simple markdown parser — bold, list, newline. No external library.
 */
function parseMarkdown(text) {
  if (!text) return "";

  const lines = text.split("\n");
  const result = [];

  lines.forEach((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    // List items: - text
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
      result.push(
        <div key={i} className="flex gap-2 ml-1">
          <span className="shrink-0 mt-0.5">•</span>
          <span>{rendered.map((r, k) => typeof r === "string" ? r.replace(/^[-•]\s/, "") : r)}</span>
        </div>
      );
    } else if (trimmed === "") {
      result.push(<div key={i} className="h-2" />);
    } else {
      result.push(<div key={i}>{rendered}</div>);
    }
  });

  return result;
}

/**
 * Format timestamp — "Baru saja", "5m lalu", or "HH:mm"
 */
function formatChatTime(date) {
  const now = dayjs();
  const d = dayjs(date);
  const diffMin = now.diff(d, "minute");

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m lalu`;
  return d.format("HH:mm");
}

const ChatBubble = memo(function ChatBubble({ message }) {
  const isUser = message.role === "USER";
  const time = useMemo(() => formatChatTime(message.createdAt), [message.createdAt]);
  const content = useMemo(
    () => (isUser ? message.content : parseMarkdown(message.content)),
    [isUser, message.content]
  );

  return (
    <div className={clsx("flex gap-2.5 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {/* Avatar */}
      <div className={clsx(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-1",
        isUser ? "bg-indigo-600 text-white" : "bg-amber-100 text-amber-600"
      )}>
        {isUser ? <User className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
      </div>

      {/* Bubble with tail */}
      <div className="relative">
        <div className={clsx(
          "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm"
            : "bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm"
        )}>
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <div className="flex flex-col gap-0.5">{content}</div>
          )}
        </div>
        <p className={clsx("text-[10px] text-gray-300 mt-1 px-1", isUser ? "text-right" : "text-left")}>
          {time}
        </p>
      </div>
    </div>
  );
});

export default ChatBubble;
