import React, { useState, useEffect } from "react";
import { Zap, Menu, X, Link, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-card shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex items-center gap-2.5 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <div className="text-left">
            <span className="font-bold text-white text-lg leading-none block">ATS</span>
            <span className="text-[10px] text-blue-400 font-mono leading-none tracking-wider">CHECKER</span>
          </div>
        </button>

        {/* Desktop Nav — merged to 2 unique links */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo("how-it-works")}
            className="nav-link text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollTo("analyzer")}
            className="nav-link text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
          >
            Analyzer
          </button>
        </div>

        {/* Right side — socials + CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Nandini's socials */}
          <motion.a
            whileHover={{ y: -2, scale: 1.1 }}
            href="https://www.linkedin.com/in/nandini-soni-89817029a?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            target="_blank"
            rel="noopener noreferrer"
            title="Nandini's LinkedIn"
            className="p-2 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200"
          >
            <Link className="w-4 h-4" />
          </motion.a>
          <motion.a
            whileHover={{ y: -2, scale: 1.1 }}
            href="mailto:nandinisoni7014@gmail.com"
            title="Email Nandini"
            className="p-2 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-200"
          >
            <Mail className="w-4 h-4" />
          </motion.a>

          <span className="w-px h-4 bg-slate-700" />

          <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Free · No Login
          </span>
          <button
            onClick={() => scrollTo("analyzer")}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            Check Resume →
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-slate-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden glass-card border-t border-blue-500/10 px-6 py-4 flex flex-col gap-4">
          <button onClick={() => scrollTo("how-it-works")} className="text-sm text-slate-300 hover:text-white font-medium text-left">How It Works</button>
          <button onClick={() => scrollTo("analyzer")} className="text-sm text-slate-300 hover:text-white font-medium text-left">Analyzer</button>
          <div className="flex gap-3">
            <a href="https://www.linkedin.com/in/nandini-soni-89817029a" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400"><Link className="w-4 h-4" /></a>
            <a href="mailto:nandinisoni7014@gmail.com" className="text-slate-400 hover:text-cyan-400"><Mail className="w-4 h-4" /></a>
          </div>
          <button onClick={() => scrollTo("analyzer")} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold text-center">
            Check Resume →
          </button>
        </div>
      )}
    </header>
  );
}
