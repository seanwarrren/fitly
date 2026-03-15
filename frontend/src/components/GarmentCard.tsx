"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface Garment {
  id: string;
  name: string;
  category: string;
  garmentType: string;
  primaryColor: string;
  formality: string;
  thickness: string;
  pattern: string;
  weatherSuitability: string[];
  notes?: string | null;
  processedImagePath: string;
}

interface GarmentCardProps {
  garment: Garment;
  onDelete: (id: string) => Promise<void>;
  onClick?: () => void;
  index?: number;
}

export default function GarmentCard({ garment, onDelete, onClick, index = 0 }: GarmentCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm(`Delete "${garment.name}"?`)) return;
    setDeleting(true);
    try {
      await onDelete(garment.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group glass-card cursor-pointer overflow-hidden transition-all duration-300 hover:border-white/[0.14] hover:shadow-glow-sm"
    >
      <div className="relative flex aspect-square items-center justify-center bg-dark-850/60 p-6">
        <img
          src={`${API_BASE}${garment.processedImagePath}`}
          alt={garment.name}
          className="h-full w-full object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-dark-900/80 text-red-400 opacity-0 backdrop-blur-sm transition-all hover:border-red-500/40 hover:bg-red-500/20 group-hover:opacity-100 disabled:opacity-40"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5 p-4">
        <h3 className="text-sm font-semibold text-white">{garment.name}</h3>

        <div className="flex flex-wrap gap-1.5">
          {[garment.category, garment.garmentType, garment.primaryColor].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
          {([
            ["Formality", garment.formality],
            ["Thickness", garment.thickness],
            ["Pattern", garment.pattern],
            ["Weather", garment.weatherSuitability.join(", ")],
          ] as const).map(([label, val]) => (
            <div key={label} className="flex gap-1">
              <span className="text-slate-600">{label}:</span>
              <span className="capitalize text-slate-400">{val}</span>
            </div>
          ))}
        </div>

        {garment.notes && (
          <p className="text-xs italic text-slate-600">{garment.notes}</p>
        )}
      </div>
    </motion.div>
  );
}
