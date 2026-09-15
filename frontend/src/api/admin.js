import apiClient from "./client";

export const getAdminStats = () => apiClient.get("/api/admin/stats").then((r) => r.data);
