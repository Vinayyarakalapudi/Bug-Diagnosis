import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { UploadCloud, FileCode2 } from "lucide-react";
import { uploadForAnalysis } from "../api/analysis";
import { getErrorMessage } from "../api/client";
import PulseTrace from "../components/PulseTrace";

const ACCEPTED = ".py,.java,.js,.ts,.jsx,.tsx,.zip,.log,.txt,.pdf,.docx,.md";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(-1);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setStageIndex(0);

    // Upload progress drives stage 0 (Detect); once the request is sent, we
    // simulate the remaining agent stages advancing while the server works,
    // since the backend runs them synchronously as one pipeline call.
    let stageTimer;
    try {
      const uploadPromise = uploadForAnalysis(file, (pct) => {
        setProgress(pct);
        if (pct >= 100) setStageIndex(1);
      });

      stageTimer = setInterval(() => {
        setStageIndex((prev) => (prev < 3 ? prev + 1 : prev));
      }, 1800);

      const analysis = await uploadPromise;
      clearInterval(stageTimer);
      setStageIndex(4);
      toast.success("Diagnosis complete.");
      setTimeout(() => navigate(`/analysis/${analysis.id}`), 400);
    } catch (err) {
      clearInterval(stageTimer);
      setStageIndex(-1);
      toast.error(getErrorMessage(err));
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="font-mono text-2xl font-semibold text-[var(--color-text)]">Upload & Diagnose</h1>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        Source code, project archives, logs, stack traces, or documentation — the pipeline
        adapts to what you send it.
      </p>

      <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8">
        {!uploading ? (
          <>
            <label
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
                dragActive ? "border-[var(--color-signal)] bg-[var(--color-signal-soft)]" : "border-[var(--color-border)]"
              }`}
            >
              <input
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <UploadCloud size={32} className="text-[var(--color-signal)]" />
              <p className="mt-4 text-sm text-[var(--color-text)]">
                {file ? (
                  <span className="flex items-center gap-2 font-mono">
                    <FileCode2 size={16} /> {file.name}
                  </span>
                ) : (
                  "Drag a file here, or click to browse"
                )}
              </p>
              <p className="mt-2 font-mono text-xs text-[var(--color-text-faint)]">
                .py .java .js .ts .zip .log .txt .pdf .docx .md — up to 50MB
              </p>
            </label>

            <button
              onClick={handleSubmit}
              disabled={!file}
              className="mt-6 w-full rounded-lg bg-[var(--color-signal)] py-3 text-sm font-medium text-[var(--color-base)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Run diagnosis
            </button>
          </>
        ) : (
          <div className="py-10">
            <p className="text-center font-mono text-sm text-[var(--color-text)]">
              {stageIndex < 4 ? "Running the diagnosis pipeline..." : "Diagnosis complete"}
            </p>
            <p className="mt-1 text-center text-xs text-[var(--color-text-faint)]">
              {stageIndex === 0 && `Uploading — ${progress}%`}
              {stageIndex === 1 && "Bug Detection Agent reading logs and exceptions"}
              {stageIndex === 2 && "Code Analysis Agent inspecting the source"}
              {stageIndex === 3 && "Knowledge Retrieval Agent searching the knowledge base"}
              {stageIndex >= 4 && "Fix Recommendation Agent finalizing the diagnosis"}
            </p>
            <div className="mx-auto mt-8 max-w-md">
              <PulseTrace activeIndex={stageIndex} size="lg" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
