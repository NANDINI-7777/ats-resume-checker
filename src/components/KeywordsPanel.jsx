import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

function KeywordChip({ word, type }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-mono ${
        type === "matched" ? "chip-green" : "chip-red"
      }`}
    >
      {type === "matched" ? (
        <CheckCircle className="w-3 h-3" />
      ) : (
        <XCircle className="w-3 h-3" />
      )}
      {word}
    </motion.span>
  );
}

export default function KeywordsPanel({ matchedKeywords = [], missingKeywords = [] }) {
  const [showAllMatched, setShowAllMatched] = useState(false);
  const [showAllMissing, setShowAllMissing] = useState(false);

  const SHOW_LIMIT = 12;
  const visibleMatched = showAllMatched ? matchedKeywords : matchedKeywords.slice(0, SHOW_LIMIT);
  const visibleMissing = showAllMissing ? missingKeywords : missingKeywords.slice(0, SHOW_LIMIT);

  const matchRate = matchedKeywords.length + missingKeywords.length > 0
    ? Math.round((matchedKeywords.length / (matchedKeywords.length + missingKeywords.length)) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Match rate bar */}
      <div className="p-4 rounded-2xl glass-card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-200">Keyword Match Rate</span>
          <span className="text-sm font-bold font-mono text-blue-400">{matchedKeywords.length}/{matchedKeywords.length + missingKeywords.length}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000"
            style={{ width: `${matchRate}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">{matchRate}% keyword coverage</p>
      </div>

      {/* Matched */}
      {matchedKeywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-emerald-300">
              Matched Keywords ({matchedKeywords.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleMatched.map((kw, i) => (
              <KeywordChip key={i} word={kw} type="matched" />
            ))}
          </div>
          {matchedKeywords.length > SHOW_LIMIT && (
            <button
              onClick={() => setShowAllMatched(!showAllMatched)}
              className="mt-2 flex items-center gap-1 text-xs text-emerald-400/70 hover:text-emerald-300 transition-colors"
            >
              {showAllMatched ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAllMatched ? "Show less" : `+${matchedKeywords.length - SHOW_LIMIT} more`}
            </button>
          )}
        </div>
      )}

      {/* Missing */}
      {missingKeywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-bold text-red-300">
              Missing Keywords ({missingKeywords.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {visibleMissing.map((kw, i) => (
              <KeywordChip key={i} word={kw} type="missing" />
            ))}
          </div>
          {missingKeywords.length > SHOW_LIMIT && (
            <button
              onClick={() => setShowAllMissing(!showAllMissing)}
              className="mt-2 flex items-center gap-1 text-xs text-red-400/70 hover:text-red-300 transition-colors"
            >
              {showAllMissing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {showAllMissing ? "Show less" : `+${missingKeywords.length - SHOW_LIMIT} more`}
            </button>
          )}
          <p className="text-xs text-slate-500 mt-3">
            💡 Add these keywords naturally to your resume using the Rewrite feature below.
          </p>
        </div>
      )}
    </div>
  );
}
