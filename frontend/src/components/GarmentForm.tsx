"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";
import {
  CATEGORIES,
  GARMENT_TYPES,
  PRIMARY_COLORS,
  FORMALITIES,
  THICKNESSES,
  PATTERNS,
  WEATHER_OPTIONS,
} from "@/lib/constants";

export interface GarmentFormData {
  name: string;
  category: string;
  garmentType: string;
  primaryColor: string;
  formality: string;
  thickness: string;
  pattern: string;
  weatherSuitability: string[];
  notes: string;
}

const INITIAL: GarmentFormData = {
  name: "",
  category: "",
  garmentType: "",
  primaryColor: "",
  formality: "",
  thickness: "",
  pattern: "",
  weatherSuitability: [],
  notes: "",
};

interface GarmentFormProps {
  onSubmit: (data: GarmentFormData) => Promise<void>;
  saving: boolean;
  initialData?: Partial<GarmentFormData>;
  title?: string;
  submitLabel?: string;
}

export default function GarmentForm({
  onSubmit,
  saving,
  initialData,
  title = "Classify This Garment",
  submitLabel = "Save to Wardrobe",
}: GarmentFormProps) {
  const [form, setForm] = useState<GarmentFormData>({ ...INITIAL });

  function set<K extends keyof GarmentFormData>(key: K, value: GarmentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // When editing, prefill the form with the selected garment’s current metadata.
  // Keep this simple: parent controls when `initialData` changes.
  useEffect(() => {
    if (!initialData) return;
    setForm((prev) => ({
      ...prev,
      ...INITIAL,
      ...initialData,
      notes: initialData.notes ?? "",
      weatherSuitability: initialData.weatherSuitability ?? [],
    }));
  }, [initialData]);

  function toggleWeather(value: string) {
    setForm((prev) => {
      const list = prev.weatherSuitability.includes(value)
        ? prev.weatherSuitability.filter((w) => w !== value)
        : [...prev.weatherSuitability, value];
      return { ...prev, weatherSuitability: list };
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const isValid =
    form.name.trim() &&
    form.category &&
    form.garmentType &&
    form.primaryColor &&
    form.formality &&
    form.thickness &&
    form.pattern &&
    form.weatherSuitability.length > 0;

  return (
    <motion.form
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="glass-card mt-6 p-6"
      onSubmit={handleSubmit}
    >
      <h2 className="mb-6 text-lg font-bold text-white">{title}</h2>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Name
          </label>
          <input
            type="text"
            className="input-dark"
            placeholder='e.g. "Navy summer tee"'
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={100}
            required
          />
        </div>

        {([
          ["Category", "category", CATEGORIES],
          ["Garment Type", "garmentType", GARMENT_TYPES],
          ["Primary Color", "primaryColor", PRIMARY_COLORS],
          ["Formality", "formality", FORMALITIES],
          ["Thickness", "thickness", THICKNESSES],
          ["Pattern", "pattern", PATTERNS],
        ] as const).map(([label, key, options]) => (
          <div key={key}>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              {label}
            </label>
            <select
              className="input-dark"
              value={form[key] as string}
              onChange={(e) => set(key, e.target.value)}
              required
            >
              <option value="">Select…</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Weather */}
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Weather Suitability
          </label>
          <div className="flex flex-wrap gap-2">
            {WEATHER_OPTIONS.map((w) => {
              const active = form.weatherSuitability.includes(w);
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => toggleWeather(w)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium capitalize transition-all duration-200 ${
                    active
                      ? "border-accent/30 bg-accent/[0.1] text-accent shadow-glow-sm"
                      : "border-white/[0.08] bg-dark-850/60 text-slate-500 hover:border-white/[0.14] hover:text-slate-300"
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Notes (optional)
          </label>
          <textarea
            className="input-dark"
            rows={2}
            placeholder="Any extra details…"
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button type="submit" disabled={!isValid || saving} className="btn-primary">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </motion.form>
  );
}
