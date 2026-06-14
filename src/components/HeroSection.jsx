import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, Target, ArrowDown, Sparkles } from "lucide-react";

const stats = [
  { value: "95%", label: "ATS Pass Rate" },
  { value: "2x", label: "More Interviews" },
  { value: "Free", label: "Always" },
  { value: "AI", label: "Powered" },
];

const features = [
  { icon: Target, label: "JD-Specific or Profession-Based Analysis" },
  { icon: Shield, label: "Real ATS Keyword Scoring" },
  { icon: Zap, label: "Instant AI Rewrite" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 grid-bg">
      {/* Ambient blobs */}
      <div className="blob w-96 h-96 bg-blue-600 top-10 -left-20" style={{ animationDuration: "9s" }} />
      <div className="blob w-80 h-80 bg-cyan-500 bottom-20 -right-20" style={{ animationDuration: "11s", animationDelay: "2s" }} />
      <div className="blob w-64 h-64 bg-violet-600 top-1/2 left-1/3" style={{ animationDuration: "13s", animationDelay: "1s" }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-blue-500/30 text-blue-400 text-sm font-medium mb-8"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          AI-Powered • Gemini Flash • 100% Free
          <Sparkles className="w-4 h-4 animate-pulse" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-7xl font-black leading-tight tracking-tight mb-6"
        >
          <span className="text-white">Beat the ATS.</span>
          <br />
          <span className="gradient-text">Land the Interview.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-6 leading-relaxed"
        >
          AI-powered resume analysis built on how <strong className="text-slate-200">real ATS systems</strong> think —
          Taleo, Workday, Greenhouse, Lever, and more. Upload your resume,
          optionally add a job description, and get a brutally honest score.
        </motion.p>

        {/* JD optional badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium mb-10"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Job Description is optional — we auto-detect your profession
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {features.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-slate-700/50 text-slate-300 text-sm"
            >
              <Icon className="w-4 h-4 text-blue-400" />
              {label}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <a
            href="#analyzer"
            className="shimmer-btn px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105"
          >
            Analyze My Resume →
          </a>
          <span className="text-slate-500 text-sm">No signup. No credit card. Ever.</span>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map(({ value, label }) => (
            <div key={label} className="glass-card rounded-2xl p-4 glow-blue">
              <div className="text-3xl font-black gradient-text">{value}</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500"
      >
        <ArrowDown className="w-5 h-5" />
      </motion.div>

      {/* How it works */}
      <div id="how-it-works" className="absolute bottom-0 w-full" />
    </section>
  );
}
