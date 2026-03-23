"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Sparkles, ShirtIcon, ArrowRight, Zap, BarChart3, CheckCircle2 } from "lucide-react";

function DecorativePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="hidden lg:block"
    >
      <motion.div
        className="w-96 rounded-2xl border border-white/[0.06] bg-dark-900/70 p-5 shadow-glow-sm backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Outfit Blueprint
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Active
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {[
            { title: "Background cleanup", detail: "Optimized for clean garment previews", badge: "Ready", tone: "text-emerald-400" },
            { title: "Secure storage", detail: "Keeps your wardrobe and media organized", badge: "Synced", tone: "text-cyan-300" },
            { title: "Outfit generation", detail: "Builds a tailored look from your garments", badge: "Ready", tone: "text-violet-300" },
          ].map(({ title, detail, badge, tone }) => (
            <div
              key={title}
              className="rounded-lg border border-white/[0.06] bg-dark-850/40 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-300">{title}</span>
                <span className={`text-[10px] font-semibold ${tone}`}>{badge}</span>
              </div>
              <div className="mt-1 text-[12px] leading-snug text-slate-500">{detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <div className="grid grid-cols-3 gap-2">
            {["Top", "Bottom", "Shoes"].map((slot) => (
              <div
                key={slot}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.08] bg-dark-850/50"
              >
                <ShirtIcon size={14} className="text-slate-600" />
                <span className="mt-1 text-[9px] text-slate-600">{slot}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2">
          <CheckCircle2 size={13} className="text-accent" />
          <span className="text-[11px] font-medium text-accent">Outfit blueprint ready</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden px-6 pb-24 pt-20">
      {/* Hero glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/[0.08] via-purple-500/[0.04] to-transparent blur-3xl" />
      </div>

      {/* Hero content */}
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-12 pt-8">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/[0.08] px-4 py-1.5 text-xs font-semibold tracking-wider text-accent shadow-glow-sm"
            >
              <Zap size={12} className="animate-glow-pulse" />
              AI WARDROBE INTELLIGENCE
            </motion.span>

            <h1 className="mt-3 text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-b from-white via-white to-slate-400 bg-clip-text text-transparent">
                Your style,
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                intelligently curated
              </span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-slate-400">
              Upload your wardrobe, classify your garments, and generate
              AI-powered outfit suggestions tailored to your style, occasion, and weather.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href="/upload" className="btn-primary group">
              <Upload size={17} />
              Upload Wardrobe
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link href="/generate" className="btn-secondary">
              <Sparkles size={17} />
              Generate Outfit
            </Link>
          </motion.div>
        </div>

        <DecorativePanel />
      </div>

      {/* Feature cards */}
      <div className="relative z-10 mx-auto mt-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              icon: Upload,
              title: "Upload & Remove BG",
              desc: "Upload clothing photos and backgrounds are removed automatically with AI.",
            },
            {
              icon: BarChart3,
              title: "Classify & Organize",
              desc: "Tag garments with type, color, formality, thickness, weather, and more.",
            },
            {
              icon: Sparkles,
              title: "Generate Outfits",
              desc: "Describe your plans in plain English and get smart outfit suggestions.",
            },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:border-white/[0.12] hover:shadow-glow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5 transition-colors group-hover:from-accent/25 group-hover:to-accent/10">
                <Icon size={19} className="text-accent" />
              </div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
