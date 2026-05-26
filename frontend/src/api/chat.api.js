import api from "./axios";

export const getChatSessions = () => api.get("/chat/sessions");

export const createChatSession = (data) => api.post("/chat/sessions", data);

export const getChatSession = (id) => api.get(`/chat/sessions/${id}`);

export const sendChatMessage = (sessionId, content) =>
  api.post(`/chat/sessions/${sessionId}/message`, { content });

export const deleteChatSession = (id) => api.delete(`/chat/sessions/${id}`);
