"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, AlertCircle, ShirtIcon, X, Trash2 } from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/api";
import GarmentCard from "@/components/GarmentCard";

interface Garment {
  id: string;
  userId: string;
  name: string;
  category: string;
  garmentType: string;
  primaryColor: string;
  formality: string;
  thickness: string;
  pattern: string;
  weatherSuitability: string[];
  notes?: string | null;
  originalImagePath: string;
  processedImagePath: string;
  createdAt: string;
}

const USER_ID = "demo-user";

export default function WardrobePage() {
  const [garments, setGarments] = useState<Garment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Garment | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGarments();
  }, []);

  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  async function fetchGarments() {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<Garment[]>(`/api/garments/${USER_ID}`);
      setGarments(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load wardrobe");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/garments/${id}`, { method: "DELETE" });
      setGarments((prev) => prev.filter((g) => g.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const handleModalDelete = useCallback(async () => {
    if (!selected || !confirm(`Delete "${selected.name}"?`)) return;
    setDeleting(true);
    try {
      await handleDelete(selected.id);
    } finally {
      setDeleting(false);
    }
  }, [selected]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Wardrobe</h1>
          {!loading && !error && (
            <p className="mt-1.5 text-sm text-slate-500">
              {garments.length} {garments.length === 1 ? "garment" : "garments"} in your collection
            </p>
          )}
        </div>
        <Link href="/upload" className="btn-primary">
          <Plus size={15} /> Upload
        </Link>
      </motion.div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-white/[0.04] bg-dark-900/40">
              <div className="skeleton aspect-square" />
              <div className="space-y-2 p-4">
                <div className="skeleton h-4 w-3/4" />
                <div className="flex gap-1.5">
                  <div className="skeleton h-5 w-14 rounded-full" />
                  <div className="skeleton h-5 w-16 rounded-full" />
                </div>
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
          <button onClick={fetchGarments} className="btn-secondary">
            Retry
          </button>
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !error && garments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card flex flex-col items-center gap-5 py-20 text-center"
        >
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5">
              <ShirtIcon size={28} className="text-accent" />
            </div>
            <div className="absolute inset-0 animate-pulse-ring rounded-2xl border-2 border-accent/20" />
          </div>
          <div>
            <p className="font-medium text-slate-300">Your wardrobe is empty</p>
            <p className="mt-1 text-sm text-slate-600">
              Upload your first garment to get started
            </p>
          </div>
          <Link href="/upload" className="btn-primary">
            <Plus size={15} /> Upload Your First Garment
          </Link>
        </motion.div>
      )}

      {/* Garment grid */}
      {!loading && garments.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {garments.map((g, i) => (
            <GarmentCard
              key={g.id}
              garment={g}
              onDelete={handleDelete}
              onClick={() => setSelected(g)}
              index={i}
            />
          ))}
        </div>
      )}

      {/* Enlarged preview modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card relative w-full max-w-4xl overflow-hidden shadow-glow"
            >
              {/* Close button */}
              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-dark-900/80 text-slate-400 backdrop-blur-sm transition-all hover:border-white/[0.15] hover:text-white"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="flex items-center justify-center bg-dark-850/60 p-8 sm:w-1/2">
                  <img
                    src={`${API_BASE}${selected.processedImagePath}`}
                    alt={selected.name}
                    className="max-h-[28rem] w-full object-contain drop-shadow-xl"
                  />
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col gap-4 p-6">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {[selected.category, selected.garmentType, selected.primaryColor].map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium capitalize text-slate-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {([
                      ["Formality", selected.formality],
                      ["Thickness", selected.thickness],
                      ["Pattern", selected.pattern],
                      ["Weather", selected.weatherSuitability.join(", ")],
                    ] as const).map(([label, val]) => (
                      <div key={label} className="flex items-baseline justify-between text-sm">
                        <span className="text-slate-500">{label}</span>
                        <span className="font-medium capitalize text-slate-300">{val}</span>
                      </div>
                    ))}
                  </div>

                  {selected.notes && (
                    <p className="text-sm italic text-slate-500">{selected.notes}</p>
                  )}

                  <div className="mt-auto pt-2">
                    <button
                      onClick={handleModalDelete}
                      disabled={deleting}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-4 py-2 text-xs font-medium text-red-400 transition-all hover:border-red-500/40 hover:bg-red-500/15 disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                      {deleting ? "Deleting…" : "Delete Garment"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
