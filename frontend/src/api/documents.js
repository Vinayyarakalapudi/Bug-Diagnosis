import apiClient from "./client";

export const uploadKnowledgeDocument = (file) => {
  const form = new FormData();
  form.append("file", file);
  return apiClient
    .post("/api/documents/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};

export const listKnowledgeDocuments = () => apiClient.get("/api/documents").then((r) => r.data);
