import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { parseResumeFile } from "../services/fileParser";

export default function FileUpload({ onTextExtracted, resumeText, resumeFileName, onReset }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [inputMode, setInputMode] = useState("file"); // "file" | "paste"
  const [pastedText, setPastedText] = useState("");
  const fileInputRef = useRef(null);

  const handleFile = useCallback(async (file) => {
    setError(null);
    setIsLoading(true);
    try {
      const text = await parseResumeFile(file);
      if (text.length < 100) {
        throw new Error("Extracted text is too short. The file may be image-based or corrupted.");
      }
      onTextExtracted(text, file.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [onTextExtracted]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleInputChange = (e) => { const file = e.target.files[0]; if (file) handleFile(file); };

  const handlePasteSubmit = () => {
    if (pastedText.trim().length < 100) {
      setError("Pasted text is too short. Please paste your full resume text.");
      return;
    }
    setError(null);
    onTextExtracted(pastedText.trim(), "Pasted Resume");
  };

  const handleReset = () => {
    setError(null);
    setShowPreview(false);
    setPastedText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    onReset();
  };

  const isUploaded = resumeText && resumeText.length > 0;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Your Resume</h3>
          <p className="text-xs text-slate-500 mt-0.5">Upload PDF/DOCX or paste text</p>
        </div>
        {/* Mode Toggle */}
        {!isUploaded && (
          <div className="flex items-center gap-1 p-1 rounded-lg glass-card border border-slate-700/50">
            {["file", "paste"].map((mode) => (
              <button
                key={mode}
                onClick={() => { setInputMode(mode); setError(null); }}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                  inputMode === mode
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {mode === "file" ? "📎 Upload" : "✏️ Paste"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Uploaded State */}
      <AnimatePresence>
        {isUploaded ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-grow flex flex-col"
          >
            {/* Success card */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-grow min-w-0">
                <p className="text-sm font-semibold text-emerald-300 truncate">{resumeFileName}</p>
                <p className="text-xs text-emerald-400/70 mt-0.5">
                  {resumeText.length.toLocaleString()} characters extracted
                </p>
              </div>
              <button
                onClick={handleReset}
                className="text-slate-500 hover:text-red-400 transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Preview toggle */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 font-medium mb-2 transition-colors"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? "Hide" : "Preview"} extracted text
            </button>

            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex-grow glass-card rounded-xl p-3 overflow-y-auto max-h-48"
                >
                  <p className="resume-preview">{resumeText}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-grow flex flex-col"
          >
            {inputMode === "file" ? (
              /* Drop Zone */
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !isLoading && fileInputRef.current?.click()}
                className={`flex-grow flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[200px] ${
                  isDragging
                    ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
                    : "border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/5"
                } ${isLoading ? "cursor-not-allowed opacity-70" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={handleInputChange}
                />
                {isLoading ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-sm text-slate-400 font-medium">Parsing your resume…</p>
                    <div className="flex gap-1.5">
                      <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 px-6 text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isDragging ? "bg-blue-500/20" : "bg-slate-800"
                    }`}>
                      <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragging ? "text-blue-400" : "text-slate-500"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {isDragging ? "Drop it here!" : "Drag & drop your resume"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">or click to browse · PDF, DOCX · Max 5MB</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Paste Zone */
              <div className="flex-grow flex flex-col gap-2">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your resume text here…&#10;&#10;Include your experience, education, skills, and all relevant sections."
                  className="flex-grow min-h-[200px] w-full p-4 rounded-2xl bg-navy-800 border border-slate-700 text-slate-200 placeholder-slate-600 text-sm font-mono leading-relaxed focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all duration-200"
                />
                <button
                  onClick={handlePasteSubmit}
                  disabled={pastedText.trim().length < 50}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200"
                >
                  Use This Text →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
