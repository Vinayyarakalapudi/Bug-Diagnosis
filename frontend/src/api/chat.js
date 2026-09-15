import apiClient from "./client";

export const sendChatMessage = (payload) => apiClient.post("/api/chat", payload).then((r) => r.data);

export const getChatSessions = () => apiClient.get("/api/chat/sessions").then((r) => r.data);

export const getChatSessionHistory = (sessionId) =>
  apiClient.get(`/api/chat/sessions/${sessionId}`).then((r) => r.data);
