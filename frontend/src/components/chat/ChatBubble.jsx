import { memo, useMemo } from "react";
import { Wallet, User, Bot, TrendingDown, CheckCheck } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
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

function renderBentoGridIfMatching(text) {
  if (!text) return null;
  // Let's check if the text contains budget comparison details.
  const lowerText = text.toLowerCase();
  if (
    (lowerText.includes("limit anggaran") || lowerText.includes("rata-rata") || lowerText.includes("limit baru")) &&
    lowerText.includes("rp")
  ) {
    // Extract Rp amounts using regex
    const rpMatches = text.match(/Rp\s*[0-9]+(?:\.[0-9]{3})*/gi);
    if (rpMatches && rpMatches.length >= 2) {
      const rataRata = rpMatches[0];
      const limitBaru = rpMatches[1];
      let target = rpMatches[2];
      
      if (!target) {
        // Calculate the savings automatically
        const val1 = parseInt(rataRata.replace(/[^0-9]/g, "")) || 0;
        const val2 = parseInt(limitBaru.replace(/[^0-9]/g, "")) || 0;
        const diff = Math.abs(val1 - val2);
        target = `Rp ${diff.toLocaleString("id-ID")}`;
      }
      
      return (
        <div className="grid grid-cols-2 gap-3 mt-3 select-none">
          <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]/50">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Rata-rata (3 bln)</p>
            <p className="font-bold text-[var(--text-primary)] text-sm tabular-nums mt-0.5">{rataRata}</p>
          </div>
          <div className="bg-[var(--bg-primary)] p-3 rounded-xl border border-[var(--border-color)]/50">
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Limit Baru</p>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 text-sm tabular-nums mt-0.5">{limitBaru}</p>
          </div>
          <div className="col-span-2 bg-indigo-500/5 p-3 rounded-xl border border-indigo-500/15 flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 leading-none">Target Penghematan</p>
              <p className="text-sm font-bold text-[var(--text-primary)] mt-1 tabular-nums">
                {target} <span className="text-[10px] font-normal text-[var(--text-tertiary)]">/bulan</span>
              </p>
            </div>
          </div>
        </div>
      );
    }
  }
  return null;
}

const ChatBubble = memo(function ChatBubble({ message }) {
  const { user } = useAuth();
  const isUser = message.role === "USER";
  const time = useMemo(() => formatChatTime(message.createdAt), [message.createdAt]);
  const initialName = useMemo(() => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user]);

  const content = useMemo(
    () => (isUser ? message.content : parseMarkdown(message.content)),
    [isUser, message.content]
  );

  const bentoGrid = useMemo(() => {
    if (isUser) return null;
    return renderBentoGridIfMatching(message.content);
  }, [isUser, message.content]);

  return (
    <div className={clsx("flex gap-3 max-w-[80%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      {/* Avatar */}
      <div className="flex-shrink-0">
        {isUser ? (
          user?.avatar ? (
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-[var(--border-color)] shadow-sm">
              <img alt="User" className="w-full h-full object-cover" src={user.avatar} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
              {initialName}
            </div>
          )
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#ffc329] text-[#6f5100] dark:bg-amber-500/20 dark:text-amber-300 flex items-center justify-center shadow-sm">
            <Bot className="h-4.5 w-4.5" />
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={clsx("space-y-1", isUser ? "text-right" : "text-left")}>
        <div className={clsx(
          "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-indigo-600 text-white rounded-tr-xs shadow-md"
            : "bg-[var(--card-bg)] border border-[var(--border-color)]/30 text-[var(--text-primary)] rounded-tl-xs"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex flex-col gap-0.5">{content}</div>
              {bentoGrid}
            </div>
          )}
        </div>
        <div className={clsx("flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] px-1", isUser ? "justify-end" : "justify-start")}>
          <span>{time}</span>
          {isUser && <CheckCheck className="h-3.5 w-3.5 text-emerald-500 ml-0.5" />}
        </div>
      </div>
    </div>
  );
});

export default ChatBubble;
