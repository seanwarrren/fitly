"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface ImagePreviewProps {
  originalPath: string;
  processedPath: string;
}

export default function ImagePreview({ originalPath, processedPath }: ImagePreviewProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card overflow-hidden"
      >
        <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
          <ImageIcon size={13} className="text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Original
          </span>
        </div>
        <div className="flex items-center justify-center p-5">
          <img
            src={`${API_BASE}${originalPath}`}
            alt="Original garment"
            className="max-h-72 rounded-lg object-contain"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
        className="glass-card overflow-hidden shadow-glow-sm"
        style={{ borderColor: "rgba(6, 182, 212, 0.15)" }}
      >
        <div className="flex items-center gap-2 border-b border-accent/10 px-4 py-2.5">
          <Sparkles size={13} className="text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">
            Processed
          </span>
        </div>
        <div className="flex items-center justify-center p-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='10' height='10' fill='%230f1629'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%230f1629'/%3E%3Crect x='10' width='10' height='10' fill='%230a0f1e'/%3E%3Crect y='10' width='10' height='10' fill='%230a0f1e'/%3E%3C/svg%3E")`,
        }}>
          <img
            src={`${API_BASE}${processedPath}`}
            alt="Background removed"
            className="max-h-72 rounded-lg object-contain drop-shadow-xl"
          />
        </div>
      </motion.div>
    </div>
  );
}
