import React from "react";
import { Zap, Heart, Link, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800/60 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center gap-6 text-center">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-lg leading-none block">ATS Checker</span>
              <span className="text-[10px] text-slate-500 leading-none">AI-Powered Resume Analysis</span>
            </div>
          </div>

          {/* Made by */}
          <p className="text-slate-300 font-semibold text-base">
            Developed by{" "}
            <span className="text-blue-400 font-bold tracking-wide">
              Nandini Soni
            </span>
          </p>

          {/* Social links */}
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href="https://www.linkedin.com/in/nandini-soni-89817029a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
              target="_blank"
              rel="noopener noreferrer"
              title="Nandini's LinkedIn"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-blue-500/20 text-blue-400 hover:text-blue-300 hover:border-blue-400/40 text-sm font-medium transition-all duration-200"
            >
              <Link className="w-4 h-4" />
              LinkedIn
            </motion.a>
            <motion.a
              whileHover={{ y: -3, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              href="mailto:nandinisoni7014@gmail.com"
              title="Email Nandini"
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card border border-cyan-500/20 text-cyan-400 hover:text-cyan-300 hover:border-cyan-400/40 text-sm font-medium transition-all duration-200"
            >
              <Mail className="w-4 h-4" />
              nandinisoni7014@gmail.com
            </motion.a>
          </div>

          {/* Stack */}
          <p className="text-slate-600 text-xs">
            Built with React · Tailwind CSS · Google Gemini AI · PDF.js
          </p>

          {/* Disclaimer + copyright */}
          <div className="border-t border-slate-800 w-full pt-6 flex flex-col gap-2">
            <p className="text-slate-700 text-[11px] max-w-lg mx-auto">
              Results are AI approximations of ATS behavior. Not affiliated with Taleo, Workday, Greenhouse, Lever, or iCIMS.
            </p>
            <p className="text-slate-700 text-[10px]">
              © {year} Nandini Soni · ATS Checker · All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
