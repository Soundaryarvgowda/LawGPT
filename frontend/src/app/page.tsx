"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Scale, BookOpen, ShieldCheck, Zap, ArrowRight, BrainCircuit } from "lucide-react";
import { useSession, signIn } from "next-auth/react";

export default function Home() {
  const { status } = useSession();
  return (
    <div className="flex flex-col items-center justify-start min-h-[120vh]">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut", staggerChildren: 0.1 }}
        className="w-full max-w-5xl flex flex-col items-center justify-center pt-32 pb-20 px-6 text-center relative z-10"
      >
        {/* AI Glowing Core (Apple Intelligence / Perplexity style) */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-blue-600 via-purple-600 to-fuchsia-600 rounded-full blur-[100px] opacity-30 mix-blend-screen pointer-events-none z-[-1] animate-pulse"></div>
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[200px] h-[200px] bg-white rounded-full blur-[80px] opacity-10 pointer-events-none z-[-1]"></div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 p-4 rounded-3xl bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] backdrop-blur-xl inline-flex"
        >
          <Scale className="w-12 h-12 text-white" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white leading-tight">
          The Future of <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Legal Intelligence
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mb-12 font-medium leading-relaxed">
          LawGPT is an elite AI research platform. Upload complex legal documents, extract decisive insights, and supercharge your case preparation with autonomous neural retrieval.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-20">
          <button 
            onClick={() => status === "authenticated" ? window.location.href = "/dashboard" : signIn("google", { callbackUrl: "/dashboard" })} 
            className="group relative px-8 py-4 bg-white text-black rounded-full hover:bg-slate-200 transition-all text-lg font-bold flex items-center gap-3 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <span>Enter Dashboard</span>
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
          <button 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors"
          >
            View Documentation
          </button>
        </div>
      </motion.div>

      {/* Feature Cards - Linear Style */}
      <div className="w-full max-w-6xl px-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-32 z-10">
        <FeatureCard 
          icon={<BookOpen size={24} className="text-blue-400" />}
          title="Neural Retrieval"
          description="Vectorized semantic search instantly surfaces exact precedents from your uploaded corpus."
          delay={0.4}
        />
        <FeatureCard 
          icon={<Zap size={24} className="text-purple-400" />}
          title="Instant Summarization"
          description="Condense 100-page judgments into 3-paragraph executive briefs in seconds."
          delay={0.5}
        />
        <FeatureCard 
          icon={<ShieldCheck size={24} className="text-emerald-400" />}
          title="Bank-Grade Security"
          description="Your sensitive legal documents remain encrypted and strictly sandboxed."
          delay={0.6}
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      className="glass-card p-8 flex flex-col items-start gap-4 group"
    >
      <div className="p-3 rounded-xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mt-2">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </motion.div>
  );
}
