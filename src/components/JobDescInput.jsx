import React from "react";
import { motion } from "framer-motion";
import { X, Info } from "lucide-react";

export default function JobDescInput({ value, onChange, onClear }) {
  const charCount = value.length;
  const isOptional = true;

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Job Description</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400">
              OPTIONAL
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Paste the JD you're applying for, or skip for profession-based analysis
          </p>
        </div>
        {charCount > 0 && (
          <button
            onClick={onClear}
            className="text-slate-500 hover:text-red-400 transition-colors mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Info banner when empty */}
      {charCount === 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/15 text-blue-400/80 text-xs">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            <strong className="text-blue-300">Without a JD:</strong> We'll auto-detect your profession from your resume and apply industry-standard ATS requirements for that role.
          </span>
        </div>
      )}

      {/* Textarea */}
      <div className="flex-grow relative flex flex-col min-h-[200px]">
        <textarea
          id="job-desc"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Paste the job description here…\n\nExample:\n• Senior Software Engineer at Acme Corp\n• Requirements: 5+ years Python, REST APIs, Kubernetes…\n• Responsibilities: Lead backend services…`}
          className="flex-grow min-h-[200px] md:min-h-full w-full p-4 rounded-2xl bg-navy-800 border border-slate-700 text-slate-200 placeholder-slate-600 text-sm leading-relaxed focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 resize-none transition-all duration-200"
        />
  
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
        <span className={charCount > 0 ? "text-blue-400 font-medium" : ""}>
          {charCount > 0 ? `${charCount.toLocaleString()} characters` : "Optional — leave blank for profession-based analysis"}
        </span>
        {charCount > 0 && (
          <span className={`font-medium ${charCount > 200 ? "text-emerald-400" : "text-yellow-500"}`}>
            {charCount > 200 ? "✓ Good length" : "Add more detail for better results"}
          </span>
        )}
      </div>
    </div>
  );
}
