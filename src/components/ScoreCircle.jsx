import React, { useEffect, useRef, useState } from "react";

const CIRCUMFERENCE = 2 * Math.PI * 70; // radius = 70

function getScoreColor(score) {
  if (score >= 75) return { stroke: "#10b981", text: "text-emerald-400", glow: "0 0 40px rgba(16,185,129,0.4)" };
  if (score >= 50) return { stroke: "#f59e0b", text: "text-yellow-400", glow: "0 0 40px rgba(245,158,11,0.4)" };
  return { stroke: "#ef4444", text: "text-red-400", glow: "0 0 40px rgba(239,68,68,0.4)" };
}

function getGradeColor(grade) {
  if (grade?.startsWith("A")) return "bg-emerald-500/20 border-emerald-500/40 text-emerald-300";
  if (grade?.startsWith("B")) return "bg-blue-500/20 border-blue-500/40 text-blue-300";
  if (grade?.startsWith("C")) return "bg-yellow-500/20 border-yellow-500/40 text-yellow-300";
  return "bg-red-500/20 border-red-500/40 text-red-300";
}

export default function ScoreCircle({ score, grade, verdict, detectedRole, analysisMode }) {
  const [displayScore, setDisplayScore] = useState(0);
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  const colors = getScoreColor(score);
  const dashOffset = CIRCUMFERENCE * (1 - displayScore / 100);

  // Count-up animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true);
          let start = 0;
          const duration = 1800;
          const startTime = performance.now();
          const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayScore(Math.round(eased * score));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [score, animated]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-6">
      {/* Mode badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          analysisMode === "jd_specific"
            ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
            : "bg-violet-500/15 border-violet-500/30 text-violet-300"
        }`}>
          {analysisMode === "jd_specific" ? "📋 JD-Specific Analysis" : "🎯 Profession-Based Analysis"}
        </span>
        {detectedRole && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 border border-slate-600/30 text-slate-300">
            {detectedRole}
          </span>
        )}
      </div>

      {/* Score circle */}
      <div className="relative" style={{ filter: `drop-shadow(${colors.glow})` }}>
        <svg width="180" height="180" viewBox="0 0 180 180">
          {/* Background track */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 90 90)"
            style={{ transition: "stroke-dashoffset 0.05s linear" }}
          />
          {/* Glow arc (blurred duplicate) */}
          <circle
            cx="90" cy="90" r="70"
            fill="none"
            stroke={colors.stroke}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 90 90)"
            opacity="0.4"
            style={{ filter: "blur(4px)", transition: "stroke-dashoffset 0.05s linear" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-black ${colors.text}`}>{displayScore}</span>
          <span className="text-slate-500 text-sm font-medium">/100</span>
        </div>
      </div>

      {/* Grade badge */}
      <div className={`px-6 py-2 rounded-2xl border text-2xl font-black ${getGradeColor(grade)}`}>
        {grade}
      </div>

      {/* Verdict */}
      {verdict && (
        <p className="text-center text-slate-300 text-sm max-w-sm leading-relaxed italic">
          "{verdict}"
        </p>
      )}
    </div>
  );
}
