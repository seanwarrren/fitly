"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, CheckCircle2, RotateCcw, Eye, ImageIcon,
  ScanLine, Sparkles,
} from "lucide-react";
import { apiUpload, apiFetch } from "@/lib/api";
import ImagePreview from "@/components/ImagePreview";
import GarmentForm, { type GarmentFormData } from "@/components/GarmentForm";

interface UploadResult {
  success: boolean;
  fileId: string;
  originalImagePath: string;
  processedImagePath: string;
}

const PROCESSING_STEPS = [
  { icon: Upload, label: "Uploading image" },
  { icon: ScanLine, label: "Removing background" },
  { icon: Sparkles, label: "Preparing preview" },
];

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  useEffect(() => {
    if (!uploading) return;
    setProcessingStep(0);
    const t1 = setTimeout(() => setProcessingStep(1), 800);
    const t2 = setTimeout(() => setProcessingStep(2), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [uploading]);

  function selectFile(file: File) {
    setUploadResult(null);
    setError(null);
    setSuccess(false);
    setLocalPreview(URL.createObjectURL(file));
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setLocalPreview(null); return; }
    selectFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) selectFile(file);
  }, []);

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiUpload<UploadResult>("/api/upload/", formData);
      setUploadResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleReset() {
    setLocalPreview(null);
    setUploadResult(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSaveGarment(formData: GarmentFormData) {
    if (!uploadResult) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/garments/", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          originalImagePath: uploadResult.originalImagePath,
          processedImagePath: uploadResult.processedImagePath,
        }),
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save garment");
    } finally {
      setSaving(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="glass-card p-10 shadow-glow-sm"
        >
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring" }}
            >
              <CheckCircle2 size={48} className="text-emerald-400" />
            </motion.div>
            <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-emerald-400/30" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">Garment Saved</h2>
          <p className="mt-2 text-sm text-slate-400">
            Your garment has been added to your wardrobe.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <button onClick={handleReset} className="btn-primary">
              <Upload size={15} /> Upload Another
            </button>
            <button onClick={() => router.push("/wardrobe")} className="btn-secondary">
              <Eye size={15} /> View Wardrobe
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight text-white">Upload Garment</h1>
        <p className="mt-2 text-slate-400">
          Upload a photo of a clothing item. The background will be automatically
          removed, then you can classify the garment.
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.08] px-5 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload zone */}
      {!uploadResult && !uploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-col items-center gap-5"
        >
          <label
            htmlFor="file-input"
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`group flex w-full max-w-lg cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
              dragOver
                ? "border-accent/60 bg-accent/[0.06] shadow-glow"
                : localPreview
                  ? "border-white/[0.1] bg-dark-900/60"
                  : "border-white/[0.08] bg-dark-900/40 hover:border-white/[0.15] hover:bg-dark-900/60"
            }`}
          >
            {localPreview ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={localPreview}
                alt="Preview"
                className="max-h-72 rounded-xl object-contain drop-shadow-lg"
              />
            ) : (
              <>
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 transition-all group-hover:from-accent/25 group-hover:to-accent/10">
                  <ImageIcon size={28} className="text-accent" />
                  <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)" }} />
                </div>
                <p className="font-medium text-slate-300">
                  Click or drag & drop an image
                </p>
                <p className="mt-1.5 text-xs text-slate-500">
                  JPG, PNG, or WebP · up to 10 MB
                </p>
              </>
            )}
          </label>
          <input
            id="file-input"
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={handleFileChange}
            hidden
          />

          {localPreview && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <button onClick={handleUpload} disabled={uploading} className="btn-primary">
                <Upload size={15} /> Upload & Remove Background
              </button>
              <button onClick={handleReset} disabled={uploading} className="btn-secondary">
                <RotateCcw size={14} /> Clear
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Processing state */}
      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex flex-col items-center"
        >
          <div className="glass-card w-full max-w-md p-8">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Loader2 size={40} className="animate-spin text-accent" />
                <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-accent/20" />
              </div>
            </div>

            <div className="space-y-3">
              {PROCESSING_STEPS.map(({ icon: Icon, label }, i) => {
                const done = processingStep > i;
                const active = processingStep === i;
                return (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm transition-colors ${
                      active ? "bg-accent/[0.08] text-accent" : done ? "text-emerald-400" : "text-slate-600"
                    }`}
                  >
                    {done ? (
                      <CheckCircle2 size={16} />
                    ) : active ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Icon size={16} />
                    )}
                    <span className={active ? "font-medium" : ""}>{label}</span>
                    {done && <span className="ml-auto text-xs text-emerald-500">Done</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Result */}
      {uploadResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <ImagePreview
            originalPath={uploadResult.originalImagePath}
            processedPath={uploadResult.processedImagePath}
          />
          <GarmentForm onSubmit={handleSaveGarment} saving={saving} />
          <div className="mt-5 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-slate-500 transition-colors hover:text-slate-300"
            >
              ← Start Over
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
