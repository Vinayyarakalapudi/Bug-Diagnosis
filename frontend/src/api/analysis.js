import apiClient from "./client";

export const uploadForAnalysis = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return apiClient
    .post("/api/analysis/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    })
    .then((r) => r.data);
};

export const getAnalysisHistory = () => apiClient.get("/api/analysis/history").then((r) => r.data);

export const getDashboardStats = () => apiClient.get("/api/analysis/dashboard").then((r) => r.data);

export const getAnalysis = (id) => apiClient.get(`/api/analysis/${id}`).then((r) => r.data);
