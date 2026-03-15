"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, Save, CheckCircle2, BookmarkIcon, Upload, Zap, Brain,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Garment {
  id: string;
  name: string;
  category: string;
  garmentType: string;
  primaryColor: string;
  formality: string;
  weatherSuitability: string[];
  processedImageUrl: string;
}

interface OutfitResult {
  success: boolean;
  outfit: {
    top: Garment | null;
    bottom: Garment | null;
    outerwear: Garment | null;
    shoes: Garment | null;
    accessory: Garment | null;
  };
  reasoning: string;
}

const SLOT_LABELS: Record<string, string> = {
  top: "Top",
  bottom: "Bottom",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessory: "Accessory",
};

const SLOTS = ["top", "bottom", "outerwear", "shoes", "accessory"] as const;

function TypewriterText({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <p className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(4px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.2 + i * 0.025, duration: 0.3 }}
        >
          {word}{" "}
        </motion.span>
      ))}
    </p>
  );
}

export default function GenerateOutfitPage() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<OutfitResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [outfitName, setOutfitName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setOutfitName("");
    try {
      const data = await apiFetch<OutfitResult>("/api/outfits/generate", {
        method: "POST",
        body: JSON.stringify({ userId: "demo-user", prompt }),
      });
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    const garmentIds = SLOTS
      .map((s) => result.outfit[s]?.id)
      .filter((id): id is string => !!id);
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/outfits/", {
        method: "POST",
        body: JSON.stringify({
          userId: "demo-user",
          name: outfitName.trim() || null,
          prompt,
          garmentIds,
          reasoning: result.reasoning,
        }),
      });
      setSaved(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save outfit");
    } finally {
      setSaving(false);
    }
  }

  const filledSlots = result ? SLOTS.filter((s) => result.outfit[s] !== null) : [];
  const emptySlots = result ? SLOTS.filter((s) => result.outfit[s] === null) : [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Generate Outfit</h1>
        <p className="mt-2 text-slate-400">
          Describe your plans and our AI will select the perfect outfit from your wardrobe.
        </p>
      </motion.div>

      {/* Prompt section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8"
      >
        <div className="glass-card overflow-hidden p-5">
          <div className="mb-3 flex items-center gap-2">
            <Brain size={15} className="text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Describe your occasion
            </span>
          </div>
          <textarea
            rows={3}
            className="input-dark !rounded-xl"
            placeholder='e.g. "Going to class then dinner with friends. It will be cool outside."'
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
          />
          <div className="mt-3">
            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className={loading ? "btn-ai pointer-events-none opacity-80" : "btn-ai"}
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Sparkles size={16} />
              )}
              {loading ? "Generating…" : "Generate Outfit"}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-6 rounded-xl border border-red-500/20 bg-red-500/[0.08] px-5 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading state */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <div className="glass-card overflow-hidden p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="relative">
                <Zap size={18} className="animate-glow-pulse text-accent" />
              </div>
              <div>
                <div className="skeleton h-4 w-48" />
                <div className="skeleton mt-1.5 h-3 w-64" />
              </div>
            </div>
            <div className="skeleton mt-3 h-16 w-full" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="overflow-hidden rounded-2xl border border-white/[0.04] bg-dark-900/40"
              >
                <div className="skeleton aspect-square" />
                <div className="space-y-2 p-3">
                  <div className="skeleton h-3 w-12 rounded-full" />
                  <div className="skeleton h-4 w-full" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      {result && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          {/* Reasoning - glass panel with typewriter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card overflow-hidden p-5 shadow-glow-sm"
            style={{ borderColor: "rgba(6, 182, 212, 0.1)" }}
          >
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              <span className="text-xs font-bold uppercase tracking-wider text-accent">
                AI Reasoning
              </span>
            </div>
            <TypewriterText
              text={result.reasoning}
              className="text-sm leading-relaxed text-slate-400"
            />
          </motion.div>

          {filledSlots.length > 0 ? (
            <>
              {/* Garment grid */}
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {filledSlots.map((slot, i) => {
                  const g = result.outfit[slot]!;
                  return (
                    <motion.div
                      key={slot}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="glass-card overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:shadow-glow-sm"
                    >
                      <div className="flex aspect-square items-center justify-center bg-dark-850/60 p-4">
                        <img
                          src={g.processedImageUrl}
                          alt={g.name}
                          className="h-full w-full object-contain drop-shadow-lg"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-accent">
                          {SLOT_LABELS[slot]}
                        </p>
                        <p className="mt-0.5 text-sm font-semibold text-white">{g.name}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {[g.garmentType, g.primaryColor].map((t) => (
                            <span
                              key={t}
                              className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium capitalize text-slate-500"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Save section */}
              {!saved ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass-card mt-6 flex flex-wrap items-center gap-3 p-4"
                >
                  <input
                    type="text"
                    className="input-dark min-w-[200px] flex-1"
                    placeholder="Outfit name (optional)"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    maxLength={120}
                  />
                  <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {saving ? "Saving…" : "Save Outfit"}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4 shadow-inner-glow"
                >
                  <div className="relative">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-400">Outfit saved!</span>
                  <Link href="/outfits" className="btn-secondary ml-auto">
                    <BookmarkIcon size={14} /> View Saved Outfits
                  </Link>
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card mt-6 flex flex-col items-center gap-4 py-12 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
                <Upload size={22} className="text-accent" />
              </div>
              <p className="text-slate-400">No garments available to build an outfit.</p>
              <Link href="/upload" className="btn-primary">
                <Upload size={15} /> Upload Garments
              </Link>
            </motion.div>
          )}

          {emptySlots.length > 0 && filledSlots.length > 0 && (
            <p className="mt-4 text-xs text-slate-600">
              Missing: {emptySlots.map((s) => SLOT_LABELS[s]).join(", ")} —{" "}
              <Link href="/upload" className="text-accent transition-colors hover:text-accent-light hover:underline">
                upload more garments
              </Link>{" "}
              to fill these slots.
            </p>
          )}
        </motion.div>
      )}
    </div>
  );
}
