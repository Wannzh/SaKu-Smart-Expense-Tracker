import { useState, useCallback } from "react";
import {
  getChatSessions,
  createChatSession,
  getChatSession,
  sendChatMessage,
  deleteChatSession,
} from "../api/chat.api";
import toast from "react-hot-toast";

export function useChat() {
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const getSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getChatSessions();
      setSessions(res.data.data.sessions);
      return res.data.data.sessions;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil sesi chat");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(async (title) => {
    try {
      const res = await createChatSession({ title });
      const session = res.data.data.session;
      setSessions((prev) => [session, ...prev]);
      setActiveSession(session);
      setMessages([]);
      return session;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal membuat sesi");
      return null;
    }
  }, []);

  const getSession = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const res = await getChatSession(id);
      const session = res.data.data.session;
      setActiveSession(session);
      setMessages(session.messages || []);
      return session;
    } catch (err) {
      toast.error(err.response?.data?.message || "Gagal mengambil sesi");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (sessionId, content) => {
      setIsSending(true);

      // Optimistic: tampilkan pesan user langsung
      const tempUserMsg = {
        id: `temp-${Date.now()}`,
        role: "USER",
        content,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUserMsg]);

      try {
        const res = await sendChatMessage(sessionId, content);
        const { userMessage, assistantMessage } = res.data.data;

        // Replace optimistic message + tambah reply
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== tempUserMsg.id),
          userMessage,
          assistantMessage,
        ]);

        // Update session title jika berubah
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, title: s.title || content.substring(0, 50) }
              : s
          )
        );

        return { userMessage, assistantMessage };
      } catch (err) {
        // Rollback optimistic message
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        toast.error(err.response?.data?.message || "Gagal mengirim pesan");
        return null;
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const deleteSession = useCallback(
    async (id) => {
      try {
        await deleteChatSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (activeSession?.id === id) {
          setActiveSession(null);
          setMessages([]);
        }
        toast.success("Sesi chat dihapus");
      } catch (err) {
        toast.error(err.response?.data?.message || "Gagal menghapus sesi");
      }
    },
    [activeSession]
  );

  return {
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
  };
}
