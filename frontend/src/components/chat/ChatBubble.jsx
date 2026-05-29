import { memo } from "react";
import { Wallet, User } from "lucide-react";
import clsx from "clsx";
import dayjs from "dayjs";

const ChatBubble = memo(function ChatBubble({ message }) {
  const isUser = message.role === "USER";
  const time = dayjs(message.createdAt).format("HH:mm");

  return (
    <div
      className={clsx(
        "flex gap-2.5 max-w-[85%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold mt-1",
          isUser
            ? "bg-indigo-600 text-white"
            : "bg-amber-100 text-amber-600"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
      </div>

      {/* Bubble */}
      <div>
        <div
          className={clsx(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
            isUser
              ? "bg-indigo-600 text-white rounded-br-md"
              : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
          )}
        >
          {message.content}
        </div>
        <p
          className={clsx(
            "text-[10px] text-gray-300 mt-1 px-1",
            isUser ? "text-right" : "text-left"
          )}
        >
          {time}
        </p>
      </div>
    </div>
  );
});

export default ChatBubble;
