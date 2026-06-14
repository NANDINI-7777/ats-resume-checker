import React, { useEffect, useRef, useState } from "react";

const categoryMeta = {
  keyword_match: {
    label: "Keyword Match",
    icon: "🔑",
    description: "How well your resume matches required keywords",
    color: "from-blue-500 to-cyan-400",
    glow: "rgba(59,130,246,0.4)",
  },
  formatting: {
    label: "ATS Formatting",
    icon: "📐",
    description: "ATS-friendliness of your resume's structure",
    color: "from-violet-500 to-purple-400",
    glow: "rgba(139,92,246,0.4)",
  },
  section_structure: {
    label: "Section Structure",
    icon: "🗂️",
    description: "Presence and labeling of standard resume sections",
    color: "from-cyan-500 to-teal-400",
    glow: "rgba(6,182,212,0.4)",
  },
  impact_language: {
    label: "Impact Language",
    icon: "💥",
    description: "Strength of action verbs and quantified results",
    color: "from-orange-500 to-amber-400",
    glow: "rgba(249,115,22,0.4)",
  },
  readability: {
    label: "Readability",
    icon: "📖",
    description: "Clarity and sentence structure for ATS parsing",
    color: "from-emerald-500 to-green-400",
    glow: "rgba(16,185,129,0.4)",
  },
};

function CategoryBar({ category, data, index }) {
  const [width, setWidth] = useState(0);
  const ref = useRef(null);
  const meta = categoryMeta[category] || { label: category, icon: "📊", color: "from-blue-500 to-cyan-400", glow: "rgba(59,130,246,0.4)" };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(data.score), index * 120);
        }
      },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [data.score, index]);

  const scoreColor = data.score >= 75 ? "text-emerald-400" : data.score >= 50 ? "text-yellow-400" : "text-red-400";

  return (
    <div ref={ref} className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{meta.icon}</span>
          <span className="text-sm font-semibold text-slate-200">{meta.label}</span>
        </div>
        <span className={`text-sm font-bold font-mono ${scoreColor}`}>{data.score}/100</span>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-1000 ease-out`}
          style={{
            width: `${width}%`,
            boxShadow: width > 0 ? `0 0 10px ${meta.glow}` : "none",
          }}
        />
      </div>

      {/* Explanation */}
      {data.explanation && (
        <p className="text-xs text-slate-500 leading-relaxed">{data.explanation}</p>
      )}
    </div>
  );
}

export default function CategoryBars({ sections }) {
  if (!sections) return null;
  const order = ["keyword_match", "formatting", "section_structure", "impact_language", "readability"];

  return (
    <div className="space-y-6">
      {order.map((key, i) => sections[key] && (
        <CategoryBar key={key} category={key} data={sections[key]} index={i} />
      ))}
    </div>
  );
}
