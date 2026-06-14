import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingUp, Shield, Zap, RotateCcw, Star } from "lucide-react";
import ScoreCircle from "./ScoreCircle";
import CategoryBars from "./CategoryBars";
import KeywordsPanel from "./KeywordsPanel";
import RewriteSection from "./RewriteSection";

function SectionCard({ title, icon: Icon, iconColor, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="glass-card rounded-3xl p-6 glow-blue"
    >
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${iconColor}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function ResultsDashboard({ results, resumeText, jobDescription, onReset }) {
  const { overall_score, grade, verdict, detected_role, analysis_mode, sections, top_improvements, ats_compatibility_warnings, strengths } = results;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Your ATS Report</h2>
          <p className="text-slate-400 text-sm mt-1">
            AI-generated analysis — scroll down to see your full breakdown and rewrite
          </p>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-slate-700/50 text-slate-400 hover:text-white text-sm font-medium transition-all duration-200 hover:border-slate-600"
        >
          <RotateCcw className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* Score + Categories row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Score circle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col items-center justify-center glow-blue"
        >
          <ScoreCircle
            score={overall_score}
            grade={grade}
            verdict={verdict}
            detectedRole={detected_role}
            analysisMode={analysis_mode}
          />
        </motion.div>

        {/* Category bars */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-3 glass-card rounded-3xl p-6"
        >
          <h3 className="text-base font-bold text-white mb-5">Category Breakdown</h3>
          <CategoryBars sections={sections} />
        </motion.div>
      </div>

      {/* Keywords + Improvements row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Keywords */}
        <SectionCard title="Keyword Analysis" icon={Zap} iconColor="bg-blue-600" delay={0.1}>
          <KeywordsPanel
            matchedKeywords={sections?.keyword_match?.matched_keywords || []}
            missingKeywords={sections?.keyword_match?.missing_keywords || []}
          />
        </SectionCard>

        {/* Top Improvements */}
        <SectionCard title="Top Improvements" icon={TrendingUp} iconColor="bg-violet-600" delay={0.2}>
          <div className="space-y-3">
            {(top_improvements || []).map((tip, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-violet-500/8 border border-violet-500/15">
                <span className="w-6 h-6 rounded-full bg-violet-600/30 text-violet-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* Warnings + Strengths row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ATS Warnings */}
        {ats_compatibility_warnings?.length > 0 && (
          <SectionCard title="ATS Compatibility Warnings" icon={AlertTriangle} iconColor="bg-amber-600" delay={0.15}>
            <div className="space-y-3">
              {ats_compatibility_warnings.map((warning, i) => (
                <div key={i} className="warning-card rounded-xl p-3 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-200/80">{warning}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}

        {/* Strengths */}
        {strengths?.length > 0 && (
          <SectionCard title="What's Working Well" icon={Star} iconColor="bg-emerald-600" delay={0.25}>
            <div className="space-y-3">
              {strengths.map((strength, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/15">
                  <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300 leading-relaxed">{strength}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>

      {/* Weak bullets */}
      {sections?.impact_language?.weak_bullets?.length > 0 && (
        <SectionCard title="Weak Bullet Points to Rewrite" icon={Shield} iconColor="bg-red-600" delay={0.3}>
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">These bullets use passive language or lack quantified results. The AI rewriter below will fix them.</p>
            {sections.impact_language.weak_bullets.map((bullet, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/8 border border-red-500/15">
                <span className="text-red-400 text-xs mt-0.5 shrink-0">⚠</span>
                <p className="text-sm text-red-300/80 font-mono">{bullet}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/30 text-slate-500 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-slate-600" />
        <p>
          This tool uses AI (Google Gemini) to simulate ATS behavior. Results are approximations and may vary across different ATS platforms including Taleo, Workday, Greenhouse, Lever, and iCIMS. Always review AI suggestions before submitting.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Rewrite section */}
      <RewriteSection
        resumeText={resumeText}
        jobDescription={jobDescription}
        analysis={results}
      />
    </div>
  );
}
