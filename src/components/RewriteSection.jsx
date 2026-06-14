import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy, Download, Loader2, AlertCircle, Sparkles, RefreshCw, MessageSquarePlus, FileText } from "lucide-react";
import { rewriteResume, identifyMissingDetails } from "../services/gemini";
import jsPDF from "jspdf";

export default function RewriteSection({ resumeText, jobDescription, analysis, onRewriteComplete }) {
  const [rewrittenResume, setRewrittenResume] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState(null);
  const [view, setView] = useState("split"); // "split" | "original" | "rewritten"
  const [copied, setCopied] = useState(false);
  
  // Gap identification state
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});

  const handleInitialRewriteClick = async () => {
    setIsLoading(true);
    setError(null);
    setLoadingText("Analyzing resume for missing details...");
    
    try {
      // 1. Ask AI for missing details
      const gaps = await identifyMissingDetails(resumeText, jobDescription, analysis);
      
      if (gaps && gaps.length > 0) {
        // AI found questions to ask
        setQuestions(gaps);
        setIsLoading(false);
      } else {
        // No gaps found, or failed to find gaps — proceed to rewrite directly
        await executeRewrite({});
      }
    } catch (err) {
      console.warn("Gap identification failed, proceeding directly to rewrite.", err);
      await executeRewrite({});
    }
  };

  const executeRewrite = async (answersToUse) => {
    setIsLoading(true);
    setError(null);
    setLoadingText("Crafting your optimized resume...");
    setRewrittenResume("");
    setQuestions([]); // Clear questions
    
    try {
      const result = await rewriteResume(resumeText, jobDescription, analysis, answersToUse);
      setRewrittenResume(result);
      if (onRewriteComplete) onRewriteComplete(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(rewrittenResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTXT = () => {
    const blob = new Blob([rewrittenResume], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ats-optimized-resume.txt";
    a.click();
    URL.revokeObjectURL(url);
  };  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const textWidth = pageWidth - margin * 2;
      
      let currentY = margin;
      
      // Clean up string and split
      const text = rewrittenResume.replace(/\r/g, '');
      const lines = text.split('\n');
      
      const commonHeaders = [
        "professional summary", "summary", "skills", "core competencies",
        "work experience", "experience", "professional experience",
        "education", "certifications", "projects", "languages", "technical skills"
      ];
      
      let isFirstLine = true;
      let inContactSection = true;

      const checkPageBreak = (heightAdded) => {
        if (currentY + heightAdded > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      lines.forEach((rawLine) => {
        const line = rawLine.trim();
        
        if (!line) {
          if (inContactSection) inContactSection = false;
          currentY += 4;
          return;
        }

        // 1. Name (First line)
        if (isFirstLine) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(18);
          doc.setTextColor(15, 23, 42); // Slate 900
          
          checkPageBreak(10);
          doc.text(line, pageWidth / 2, currentY, { align: "center" });
          currentY += 6;
          isFirstLine = false;
          return;
        }

        // 2. Contact Info
        if (inContactSection) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(71, 85, 105); // Slate 600
          
          let contactLine = line;
          // Auto-prepend + for phone numbers
          if (/^\d[\d\s-]{9,15}$/.test(contactLine) && !contactLine.startsWith('+')) {
            contactLine = '+' + contactLine;
          }

          checkPageBreak(5);
          doc.text(contactLine, pageWidth / 2, currentY, { align: "center" });
          currentY += 4.5;
          return;
        }

        doc.setTextColor(30, 41, 59); // Slate 800
        
        // 3. Section Headers
        const isHeader = 
          commonHeaders.includes(line.toLowerCase()) || 
          (line === line.toUpperCase() && line.length > 2 && line.length < 35 && !line.includes("•") && !line.includes("-"));
          
        if (isHeader) {
          currentY += 6; 
          checkPageBreak(10);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(15, 23, 42);
          
          doc.text(line.toUpperCase(), margin, currentY);
          currentY += 2;
          
          doc.setDrawColor(203, 213, 225); 
          doc.setLineWidth(0.5);
          doc.line(margin, currentY, pageWidth - margin, currentY);
          
          currentY += 6;
          return;
        }

        // 4. Bullet Points
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        let textToPrint = line;
        let xOffset = margin;
        let currentTextWidth = textWidth;
        
        if (isBullet) {
          textToPrint = line.substring(1).trim();
          xOffset = margin + 5;
          currentTextWidth = textWidth - 5;
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text('•', margin + 1.5, currentY);
        } else {
          // If it's a non-bullet line right after a header, it's often a job title or company
          // We can guess it's a subheader if it's short and contains a pipe or comma or dates
          const hasDate = /\b(19|20)\d{2}\b/.test(line) || /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line);
          const hasSeparator = line.includes('|') || line.includes('-');
          
          if (line.length < 80 && (hasDate || hasSeparator)) {
            doc.setFont("helvetica", "bold");
          } else {
            doc.setFont("helvetica", "normal");
          }
        }
        
        doc.setFontSize(10);
        
        const splitLine = doc.splitTextToSize(textToPrint, currentTextWidth);
        
        checkPageBreak(splitLine.length * 5);
        doc.text(splitLine, xOffset, currentY);
        currentY += splitLine.length * 5; 
      });

      doc.save("ats-optimized-resume.pdf");
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please use TXT download instead.");
    }
  };

  const missingCount = analysis?.sections?.keyword_match?.missing_keywords?.length || 0;
  const weakCount = analysis?.sections?.impact_language?.weak_bullets?.length || 0;
  const issueCount = analysis?.sections?.formatting?.issues?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-violet-400" />
            AI Resume Rewriter
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Rewrites your resume to maximize ATS scores while keeping your real experience intact
          </p>
        </div>

        {!rewrittenResume && questions.length === 0 ? (
          <button
            onClick={handleInitialRewriteClick}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-105 whitespace-nowrap"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Rewrite My Resume →
              </>
            )}
          </button>
        ) : rewrittenResume ? (
          <button
            onClick={handleInitialRewriteClick}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-violet-500/30 text-violet-300 hover:text-violet-200 text-sm font-medium transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            Regenerate
          </button>
        ) : null}
      </div>

      {/* What will be fixed */}
      {!rewrittenResume && !isLoading && questions.length === 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: "🔑", label: `${missingCount} missing keywords`, sub: "will be added naturally" },
            { icon: "💥", label: `${weakCount} weak bullets`, sub: "rewritten with STAR method" },
            { icon: "📐", label: `${issueCount} formatting issues`, sub: "will be fixed" },
          ].map(({ icon, label, sub }) => (
            <div key={label} className="p-3 rounded-xl glass-card border border-slate-700/40 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <div className="text-xs font-bold text-slate-200">{label}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Question Form */}
      <AnimatePresence>
        {!isLoading && questions.length > 0 && !rewrittenResume && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 border border-blue-500/30 shadow-lg shadow-blue-500/10 space-y-6"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <MessageSquarePlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Missing Information Detected</h3>
                <p className="text-sm text-slate-300 mt-1">
                  We found a few gaps in your resume. Providing this info will significantly improve your ATS score and final rewrite.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="block text-sm font-medium text-slate-200">
                    {idx + 1}. {q.question}
                  </label>
                  <textarea
                    value={userAnswers[q.question] || ""}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [q.question]: e.target.value })}
                    placeholder={q.example ? `Example: ${q.example}` : "Your answer..."}
                    className="w-full p-3 rounded-xl bg-navy-900 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none min-h-[80px]"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => executeRewrite({})}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
              >
                Skip & Rewrite Anyway
              </button>
              <button
                onClick={() => executeRewrite(userAnswers)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
              >
                Finalize Rewrite →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 py-12 glass-card rounded-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Wand2 className="w-8 h-8 text-violet-400 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-white font-semibold">{loadingText}</p>
              <p className="text-slate-400 text-sm mt-1">Please wait a few moments...</p>
            </div>
            <div className="flex gap-2">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300 mb-0.5">Operation Failed</p>
              <p className="text-red-400/80">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results — Side by side */}
      <AnimatePresence>
        {rewrittenResume && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* View toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 p-1 rounded-xl glass-card border border-slate-700/50 hidden sm:flex">
                {[
                  { key: "split", label: "Split View" },
                  { key: "original", label: "Original" },
                  { key: "rewritten", label: "Rewritten" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      view === key
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card border border-slate-700/50 text-xs font-medium text-slate-300 hover:text-white transition-all duration-200"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={handleDownloadTXT}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white transition-all duration-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  TXT
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-all duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>

            {/* Panels */}
            <div className={`grid gap-4 ${view === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
              {/* Original */}
              {(view === "split" || view === "original") && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400 uppercase tracking-wider">Original</span>
                  </div>
                  <div className="glass-card rounded-2xl p-4 max-h-[500px] overflow-y-auto">
                    <p className="resume-preview opacity-60">{resumeText}</p>
                  </div>
                </div>
              )}

              {/* Rewritten */}
              {(view === "split" || view === "rewritten") && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-600/40 text-violet-300 uppercase tracking-wider">ATS Optimized</span>
                    <span className="text-[10px] text-emerald-400 font-medium">✨ AI Rewritten</span>
                  </div>
                  <div className="glass-card rounded-2xl p-4 max-h-[500px] overflow-y-auto border border-violet-500/20">
                    <p className="rewrite-text">{rewrittenResume}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <p className="text-[11px] text-slate-600 text-center">
              ⚠️ AI-generated rewrite. Always review and verify accuracy before submitting. Real experience preserved — no fabrication.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
