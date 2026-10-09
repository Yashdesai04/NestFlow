"use client";

import { useRef, useState, useEffect } from "react";
import { signLeaseAgreement } from "@/app/dashboard/tenant/lease/actions";
import {
  PenTool,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  ShieldCheck,
  Loader2,
} from "lucide-react";

interface LeaseSignaturePadProps {
  leaseId: string;
  tenantName: string;
}

export function LeaseSignaturePad({ leaseId, tenantName }: LeaseSignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#ea580c"; // Dark orange ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSignatureData("");
  };

  return (
    <div className="bg-white/70 dark:bg-white/[0.05] border border-orange-200/60 dark:border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6 print:hidden">
      <div className="flex items-center justify-between border-b border-orange-100 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-orange-500/10 dark:bg-rose-500/15 text-orange-600 dark:text-rose-400 rounded-2xl border border-orange-200/50 dark:border-rose-500/20">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-950 dark:text-white tracking-tight">
              Digital Signature Counter-Sign
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Draw your legal signature in the box below to finalize your lease
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={clearCanvas}
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-orange-100 dark:border-white/10 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Canvas Pad */}
        <div className="relative border-2 border-dashed border-orange-200 dark:border-white/20 rounded-2xl bg-white/90 dark:bg-black/30 overflow-hidden cursor-crosshair">
          <canvas
            ref={canvasRef}
            width={700}
            height={160}
            className="w-full h-[160px] touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasDrawn && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-semibold">
              Draw your digital signature here
            </div>
          )}
        </div>

        <form
          action={async (formData) => {
            setIsSubmitting(true);
            try {
              await signLeaseAgreement(formData);
            } finally {
              setIsSubmitting(false);
            }
          }}
          className="space-y-4"
        >
          <input type="hidden" name="leaseId" value={leaseId} />
          <input type="hidden" name="signatureData" value={signatureData} />

          {/* Consent Checkbox */}
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/60 dark:bg-white/[0.03] border border-orange-100/80 dark:border-white/10 cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              required
              className="mt-0.5 rounded border-orange-300 text-orange-500 focus:ring-orange-400 cursor-pointer"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
              I, <strong className="text-slate-950 dark:text-white">{tenantName}</strong>, have thoroughly reviewed this lease agreement, agree to comply with property guidelines, and understand this electronic signature constitutes a legally binding counter-signature.
            </span>
          </label>

          <button
            type="submit"
            disabled={!hasDrawn || !termsAccepted || isSubmitting}
            className="w-full bg-gradient-to-r from-orange-400 via-amber-400 to-sky-500 dark:from-rose-500 dark:via-purple-500 dark:to-indigo-600 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording E-Signature...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4" />
                <span>E-Sign & Activate Lease Agreement</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}