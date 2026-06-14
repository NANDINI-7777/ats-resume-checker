import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, ChevronDown, Info } from "lucide-react";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FileUpload from "./components/FileUpload";
import JobDescInput from "./components/JobDescInput";
import ResultsDashboard from "./components/ResultsDashboard";
import Footer from "./components/Footer";
import { analyzeResume } from "./services/gemini";

// How It Works steps
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Upload Your Resume",
    desc: "Drag & drop a PDF or DOCX, or paste your resume text directly.",
    icon: "📄",
  },
  {
    step: "02",
    title: "Add Job Description (Optional)",
    desc: "Paste a JD for targeted analysis, or skip — we'll auto-detect your profession.",
    icon: "📋",
  },
  {
    step: "03",
    title: "Get Your ATS Score",
    desc: "AI evaluates keywords, formatting, structure, impact language & readability.",
    icon: "🎯",
  },
  {
    step: "04",
    title: "Rewrite & Download",
    desc: "One-click AI rewrite that fixes every issue. Download as .txt instantly.",
    icon: "✨",
  },
];

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  const resultsRef = useRef(null);
  const analyzerRef = useRef(null);

  const handleResumeExtracted = useCallback((text, fileName) => {
    setResumeText(text);
    setResumeFileName(fileName);
    setError(null);
    setAnalysisResults(null);
  }, []);

  const handleReset = useCallback(() => {
    setResumeText("");
    setResumeFileName("");
    setJobDescription("");
    setAnalysisResults(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleAnalyze = async () => {
    if (!resumeText || resumeText.trim().length < 100) {
      setError("Please upload a resume or paste your resume text first.");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResults(null);

    try {
      // JD is optional — pass empty string if not provided
      const results = await analyzeResume(resumeText.trim(), jobDescription.trim());
      setAnalysisResults(results);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isResumeReady = resumeText.trim().length >= 100;
  // JD is optional — button only requires resume
  const canAnalyze = isResumeReady && !loading;

  return (
    <div className="min-h-screen bg-[#040d1a] text-slate-200 flex flex-col antialiased">
      <Navbar />
      <HeroSection />

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-white mb-3">How It Works</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Four simple steps to a resume that passes ATS filters</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="text-3xl mb-3">{icon}</div>
                <div className="text-xs font-mono text-blue-400/60 mb-1">{step}</div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                <div className="absolute top-4 right-4 text-5xl font-black text-white/3 font-mono">{step}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analyzer Section */}
      <section id="analyzer" ref={analyzerRef} className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-black text-white mb-2">Analyze Your Resume</h2>
            <p className="text-slate-500">
              Upload your resume · Add a job description (optional) · Get your ATS score
            </p>
          </motion.div>

          {/* Input grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Upload */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-6 flex flex-col min-h-[320px] glow-blue"
            >
              <FileUpload
                onTextExtracted={handleResumeExtracted}
                resumeText={resumeText}
                resumeFileName={resumeFileName}
                onReset={() => {
                  setResumeText("");
                  setResumeFileName("");
                  setAnalysisResults(null);
                }}
              />
            </motion.div>

            {/* JD */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-6 flex flex-col min-h-[320px]"
            >
              <JobDescInput
                value={jobDescription}
                onChange={setJobDescription}
                onClear={() => setJobDescription("")}
              />
            </motion.div>
          </div>

          {/* Analyze button */}
          <div className="flex flex-col items-center gap-4">
            <motion.button
              whileHover={canAnalyze ? { scale: 1.03, y: -2 } : {}}
              whileTap={canAnalyze ? { scale: 0.98 } : {}}
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className={`w-full sm:w-auto min-w-[280px] px-10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl ${
                !isResumeReady
                  ? "bg-slate-800 border border-slate-700 text-slate-600 cursor-not-allowed"
                  : loading
                  ? "bg-blue-900/50 border border-blue-500/20 text-blue-400 cursor-not-allowed"
                  : "shimmer-btn text-white shadow-blue-500/30 hover:shadow-blue-500/50 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing with AI…
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Analyze My Resume →
                </>
              )}
            </motion.button>

            {/* Helper text */}
            {!isResumeReady && !loading && (
              <p className="text-xs text-slate-600 font-medium">
                Upload or paste your resume to unlock analysis
              </p>
            )}
            {isResumeReady && !jobDescription && !loading && !analysisResults && (
              <p className="text-xs text-blue-400/70 flex items-center gap-1.5">
                <Info className="w-3 h-3" />
                No JD provided — will auto-detect your profession for analysis
              </p>
            )}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 max-w-2xl mx-auto p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-red-400 flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-300 text-sm">Analysis Failed</p>
                  <p className="text-xs mt-0.5 text-red-400/80">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading state details */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-8 flex flex-col items-center gap-3"
              >
                <div className="flex gap-2">
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                  <div className="loading-dot" />
                </div>
                <p className="text-sm text-slate-500">
                  {jobDescription
                    ? "Comparing resume against job description…"
                    : "Detecting profession and running ATS analysis…"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div ref={resultsRef} className="scroll-mt-24">
            <AnimatePresence>
              {analysisResults && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-16 border-t border-slate-800/60 pt-16"
                >
                  <ResultsDashboard
                    results={analysisResults}
                    resumeText={resumeText}
                    jobDescription={jobDescription}
                    onReset={handleReset}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
