"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Loader2, CheckCircle2, RotateCcw, Eye, ImageIcon,
  ScanLine, Sparkles, CloudUpload,
} from "lucide-react";
import { apiUpload, apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { removeBackground } from "@/lib/removeBackground";
import { resizeImage } from "@/lib/resizeImage";
import ImagePreview from "@/components/ImagePreview";
import GarmentForm, { type GarmentFormData } from "@/components/GarmentForm";

interface UploadResult {
  success: boolean;
  fileId: string;
  originalImageUrl: string;
  processedImageUrl: string;
  originalImagePublicId: string;
  processedImagePublicId: string;
}

type Step = "select" | "removing" | "preview" | "uploading" | "form" | "success";

const REMOVING_STEPS = [
  { icon: ScanLine, label: "Analyzing image" },
  { icon: Sparkles, label: "Removing background" },
];

export default function UploadPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("select");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [removingStep, setRemovingStep] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [authLoading, user, router]);

  function selectFile(file: File) {
    setError(null);
    setSelectedFile(file);
    setOriginalPreview(URL.createObjectURL(file));
    setProcessedBlob(null);
    setProcessedPreview(null);
    setUploadResult(null);
    setStep("select");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    selectFile(file);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) selectFile(file);
  }, []);

  async function handleRemoveBackground() {
    if (!selectedFile) return;
    setStep("removing");
    setRemovingStep(0);
    setError(null);

    const t = setTimeout(() => setRemovingStep(1), 1500);

    try {
      const blob = await removeBackground(selectedFile);
      setProcessedBlob(blob);
      setProcessedPreview(URL.createObjectURL(blob));
      setStep("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Background removal failed");
      setStep("select");
    } finally {
      clearTimeout(t);
    }
  }

  async function handleUploadBoth() {
    if (!selectedFile || !processedBlob) return;
    setStep("uploading");
    setError(null);

    try {
      const resizedOriginal = await resizeImage(selectedFile, "image/jpeg");
      const resizedProcessed = await resizeImage(processedBlob, "image/png");

      const formData = new FormData();
      formData.append("originalFile", resizedOriginal, "original.jpg");
      formData.append("processedFile", resizedProcessed, "processed.png");
      const data = await apiUpload<UploadResult>("/api/upload/", formData);
      setUploadResult(data);
      setStep("form");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStep("preview");
    }
  }

  function handleReset() {
    setStep("select");
    setSelectedFile(null);
    setOriginalPreview(null);
    setProcessedBlob(null);
    setProcessedPreview(null);
    setUploadResult(null);
    setError(null);
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
          originalImageUrl: uploadResult.originalImageUrl,
          processedImageUrl: uploadResult.processedImageUrl,
          originalImagePublicId: uploadResult.originalImagePublicId,
          processedImagePublicId: uploadResult.processedImagePublicId,
        }),
      });
      setStep("success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save garment");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) return null;

  if (step === "success") {
    return (
      <div className="mx-auto max-w-md px-6 pt-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="glass-card p-10 shadow-glow-sm"
        >
          <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: "spring" }}>
              <CheckCircle2 size={48} className="text-emerald-400" />
            </motion.div>
            <div className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-emerald-400/30" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-white">Garment Saved</h2>
          <p className="mt-2 text-sm text-slate-400">Your garment has been added to your wardrobe.</p>
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
          Upload a photo of a clothing item. The background will be removed in your browser,
          then you can classify the garment.
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

      {/* Step 1: Select image */}
      {step === "select" && (
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
                : originalPreview
                  ? "border-white/[0.1] bg-dark-900/60"
                  : "border-white/[0.08] bg-dark-900/40 hover:border-white/[0.15] hover:bg-dark-900/60"
            }`}
          >
            {originalPreview ? (
              <motion.img
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                src={originalPreview}
                alt="Preview"
                className="max-h-72 rounded-xl object-contain drop-shadow-lg"
              />
            ) : (
              <>
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 transition-all group-hover:from-accent/25 group-hover:to-accent/10">
                  <ImageIcon size={28} className="text-accent" />
                  <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.15)" }} />
                </div>
                <p className="font-medium text-slate-300">Click or drag & drop an image</p>
                <p className="mt-1.5 text-xs text-slate-500">JPG, PNG, or WebP · up to 10 MB</p>
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

          {originalPreview && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <button onClick={handleRemoveBackground} className="btn-primary">
                <Sparkles size={15} /> Remove Background
              </button>
              <button onClick={handleReset} className="btn-secondary">
                <RotateCcw size={14} /> Clear
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Step 2: Removing background */}
      {step === "removing" && (
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
            <p className="mb-4 text-center text-xs text-slate-500">
              Processing in your browser — this may take a moment on first use
            </p>
            <div className="space-y-3">
              {REMOVING_STEPS.map(({ icon: Icon, label }, i) => {
                const done = removingStep > i;
                const active = removingStep === i;
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
                    {done ? <CheckCircle2 size={16} /> : active ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                    <span className={active ? "font-medium" : ""}>{label}</span>
                    {done && <span className="ml-auto text-xs text-emerald-500">Done</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Preview both images */}
      {step === "preview" && originalPreview && processedPreview && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <ImagePreview originalUrl={originalPreview} processedUrl={processedPreview} />
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={handleUploadBoth} className="btn-primary">
              <CloudUpload size={15} /> Save & Continue
            </button>
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw size={14} /> Start Over
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 4: Uploading to cloud */}
      {step === "uploading" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 flex flex-col items-center"
        >
          <div className="glass-card flex w-full max-w-md flex-col items-center gap-4 p-8">
            <Loader2 size={32} className="animate-spin text-accent" />
            <p className="text-sm text-slate-400">Uploading images…</p>
          </div>
        </motion.div>
      )}

      {/* Step 5: Garment metadata form */}
      {step === "form" && uploadResult && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <ImagePreview
            originalUrl={uploadResult.originalImageUrl}
            processedUrl={uploadResult.processedImageUrl}
          />
          <GarmentForm onSubmit={handleSaveGarment} saving={saving} />
          <div className="mt-5 text-center">
            <button onClick={handleReset} className="text-sm text-slate-500 transition-colors hover:text-slate-300">
              ← Start Over
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
