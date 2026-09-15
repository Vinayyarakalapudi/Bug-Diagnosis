import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BookOpen, UploadCloud, FileText } from "lucide-react";
import { listKnowledgeDocuments, uploadKnowledgeDocument } from "../api/documents";
import { getErrorMessage } from "../api/client";
import Loader from "../components/Loader";

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadDocuments = () => {
    setLoading(true);
    listKnowledgeDocuments()
      .then(setDocuments)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadKnowledgeDocument(file);
      toast.success(res.message);
      loadDocuments();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">Knowledge Base</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            PDFs, Word docs, Markdown, and text files here are chunked, embedded, and retrieved
            during diagnosis and chat.
          </p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-signal)] px-4 py-2.5 text-sm font-medium text-[var(--color-base)] hover:opacity-90">
          <UploadCloud size={16} />
          {uploading ? "Uploading..." : "Upload document"}
          <input type="file" accept=".pdf,.docx,.md,.txt" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader label="Loading documents" />
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] py-16 text-center">
          <BookOpen size={28} className="text-[var(--color-text-faint)]" />
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">No documents in the knowledge base yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <div key={doc.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
              <FileText size={18} className="text-[var(--color-signal)]" />
              <p className="mt-3 truncate font-mono text-sm text-[var(--color-text)]">{doc.filename}</p>
              <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                {doc.chunk_count} chunks · {new Date(doc.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
