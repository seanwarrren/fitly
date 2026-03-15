"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Loader2, AlertCircle, Trash2, Calendar, MessageSquare,
  ChevronDown, Zap,
} from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/api";

interface Garment {
  id: string;
  name: string;
  garmentType: string;
  primaryColor: string;
  formality: string;
  processedImagePath: string;
}

interface SavedOutfit {
  id: string;
  userId: string;
  name: string | null;
  prompt: string;
  garmentIds: string[];
  reasoning: string;
  createdAt: string;
}

const USER_ID = "demo-user";

function OutfitCard({
  outfit,
  garments,
  onDelete,
  index,
}: {
  outfit: SavedOutfit;
  garments: Garment[];
  onDelete: (id: string) => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, ease: "easeOut" }}
      className="glass-card overflow-hidden transition-all duration-300 hover:border-white/[0.12] hover:shadow-glow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.04] px-5 py-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-white">
            {outfit.name || "Untitled Outfit"}
          </h3>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {new Date(outfit.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={11} />
              {garments.length} garment{garments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDelete(outfit.id)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/[0.06] text-red-400 opacity-60 transition-all hover:border-red-500/40 hover:bg-red-500/15 hover:opacity-100"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Prompt */}
      <div className="border-b border-white/[0.04] px-5 py-3">
        <p className="flex items-start gap-2 text-xs text-slate-400">
          <MessageSquare size={12} className="mt-0.5 shrink-0 text-slate-600" />
          <span className="line-clamp-2">
            <strong className="text-slate-300">Prompt:</strong> {outfit.prompt}
          </span>
        </p>
      </div>

      {/* Reasoning - expandable */}
      <div className="border-b border-white/[0.04] px-5 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center gap-2 text-left text-xs text-slate-500 transition-colors hover:text-slate-400"
        >
          <Sparkles size={11} className="text-accent/60" />
          <span className="font-medium">AI Reasoning</span>
          <ChevronDown
            size={13}
            className={`ml-auto transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-2 overflow-hidden text-xs leading-relaxed text-slate-500"
            >
              {outfit.reasoning}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Garments */}
      {garments.length > 0 ? (
        <div className="flex gap-2.5 overflow-x-auto px-5 py-4">
          {garments.map((g) => (
            <div
              key={g.id}
              className="flex w-24 shrink-0 flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-dark-850/50 transition-all hover:border-white/[0.12]"
            >
              <div className="flex aspect-square items-center justify-center p-2">
                <img
                  src={`${API_BASE}${g.processedImagePath}`}
                  alt={g.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="border-t border-white/[0.04] px-2 py-1.5">
                <p className="truncate text-[10px] font-medium text-white">{g.name}</p>
                <p className="truncate text-[9px] capitalize text-slate-600">
                  {g.garmentType} · {g.primaryColor}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-3 text-xs text-slate-600">
          Garments no longer in wardrobe.
        </p>
      )}
    </motion.div>
  );
}

export default function SavedOutfitsPage() {
  const [outfits, setOutfits] = useState<SavedOutfit[]>([]);
  const [garmentMap, setGarmentMap] = useState<Record<string, Garment>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError(null);
    try {
      const [outfitData, garmentData] = await Promise.all([
        apiFetch<SavedOutfit[]>(`/api/outfits/${USER_ID}`),
        apiFetch<Garment[]>(`/api/garments/${USER_ID}`),
      ]);
      setOutfits(outfitData);
      const map: Record<string, Garment> = {};
      for (const g of garmentData) map[g.id] = g;
      setGarmentMap(map);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load outfits");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this outfit?")) return;
    try {
      await apiFetch(`/api/outfits/${id}`, { method: "DELETE" });
      setOutfits((prev) => prev.filter((o) => o.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Saved Outfits</h1>
          {!loading && !error && (
            <p className="mt-1.5 text-sm text-slate-500">
              {outfits.length} saved {outfits.length === 1 ? "outfit" : "outfits"}
            </p>
          )}
        </div>
        <Link href="/generate" className="btn-ai">
          <Sparkles size={15} /> Generate
        </Link>
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.04] bg-dark-900/40">
              <div className="space-y-2 p-5">
                <div className="skeleton h-5 w-48" />
                <div className="skeleton h-3 w-32" />
              </div>
              <div className="border-t border-white/[0.04] p-5">
                <div className="skeleton h-4 w-full" />
              </div>
              <div className="flex gap-2.5 border-t border-white/[0.04] p-5">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="skeleton h-24 w-24 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card flex flex-col items-center gap-4 py-12 text-center"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={fetchData} className="btn-secondary">
            Retry
          </button>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && outfits.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col items-center gap-5 py-20 text-center"
        >
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/15 to-cyan-500/10">
              <Sparkles size={28} className="text-purple-400" />
            </div>
            <div className="absolute inset-0 animate-pulse-ring rounded-2xl border-2 border-purple-400/20" />
          </div>
          <div>
            <p className="font-medium text-slate-300">No saved outfits yet</p>
            <p className="mt-1 text-sm text-slate-600">
              Generate your first outfit to get started
            </p>
          </div>
          <Link href="/generate" className="btn-ai">
            <Sparkles size={15} /> Generate Your First Outfit
          </Link>
        </motion.div>
      )}

      {/* Outfit list */}
      {!loading && outfits.length > 0 && (
        <div className="space-y-5">
          {outfits.map((outfit, i) => {
            const garments = outfit.garmentIds
              .map((gid) => garmentMap[gid])
              .filter(Boolean);
            return (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                garments={garments}
                onDelete={handleDelete}
                index={i}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
