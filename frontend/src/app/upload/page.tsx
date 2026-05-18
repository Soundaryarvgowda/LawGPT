"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, X, Loader2 } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{type: "success" | "error", msg: string} | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const { data: session } = useSession();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setStatus(null);
      } else {
        setStatus({ type: "error", msg: "Invalid file format. Only PDFs are allowed." });
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = (session as any)?.accessToken;
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/upload-pdf`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`
        }
      });
      setStatus({ type: "success", msg: "Corpus successfully ingested into neural databank." });
      setFile(null);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.response?.data?.detail || "Ingestion protocol failed." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 py-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Corpus Ingestion</h1>
          <p className="text-slate-400">Securely upload legal documents to expand your AI's knowledge base.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative w-full h-80 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center overflow-hidden ${
            isDragActive 
              ? "border-[#0A84FF] bg-[#0A84FF]/5 shadow-[0_0_40px_rgba(10,132,255,0.2)]" 
              : "border-white/10 glass-panel hover:border-white/20 hover:bg-white/5"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {/* Animated background rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
              animate={{ scale: isDragActive ? 1.5 : 1, opacity: isDragActive ? 0.5 : 0 }}
              transition={{ duration: 0.5 }}
              className="w-96 h-96 rounded-full border border-[#0A84FF]/30 blur-[2px]"
            />
            <motion.div 
              animate={{ scale: isDragActive ? 1.2 : 0.8, opacity: isDragActive ? 0.3 : 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="absolute w-64 h-64 rounded-full border border-violet-500/30 blur-[1px]"
            />
          </div>

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center z-10"
              >
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center border border-white/10 animate-float">
                  <UploadCloud size={40} className="text-[#0A84FF]" />
                </div>
                <h3 className="text-xl font-medium text-white mb-2">Drag & drop your PDF here</h3>
                <p className="text-slate-400 text-sm mb-6">Max file size: 50MB. Secure 256-bit encryption.</p>
                <label className="glow-border px-6 py-2.5 bg-black/50 text-white font-medium rounded-lg hover:bg-black/80 transition-all cursor-pointer">
                  <span className="relative z-10">Browse Files</span>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setStatus(null);
                      }
                    }}
                  />
                </label>
              </motion.div>
            ) : (
              <motion.div 
                key="file"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center z-10 w-full px-12"
              >
                <div className="w-full max-w-md glass-card p-6 rounded-2xl flex items-center justify-between border-blue-500/30 shadow-[0_0_30px_rgba(10,132,255,0.1)] relative overflow-hidden">
                  {uploading && (
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "linear" }} // Fake progress
                      className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500"
                    />
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                      <FileText size={28} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-medium text-white truncate max-w-[200px]">{file.name}</span>
                      <span className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  </div>
                  
                  {!uploading && (
                    <button 
                      onClick={() => setFile(null)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="mt-8 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Processing Vectors...
                    </>
                  ) : (
                    "Initiate Ingestion"
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {status && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl flex items-center gap-3 glass-panel ${
              status.type === "success" 
                ? "border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]" 
                : "border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
            }`}
          >
            {status.type === "success" ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            <span className="font-medium">{status.msg}</span>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
