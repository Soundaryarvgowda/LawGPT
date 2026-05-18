"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useState, useRef, useEffect } from "react";
import { Send, Hexagon, User, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useSession } from "next-auth/react";

type Message = { role: "user" | "ai"; text: string; sources?: any[] };

export default function ResearchPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "I am LawGPT. My neural databanks are loaded with your corpus. What legal precedent are we seeking today?" }
  ]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { role: "user" as const, text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const token = (session as any)?.accessToken;
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "https://lawgpt-e16g.onrender.com"}/query`, 
        { query: userMessage.text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiMessage = { role: "ai" as const, text: res.data.response, sources: res.data.sources };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = { role: "ai" as const, text: "System error: Failed to connect to retrieval engine. Please ensure backend is online." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto relative glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Background glow in chat */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(138,43,226,0.03),transparent_70%)] pointer-events-none" />

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 scroll-smooth custom-scrollbar relative z-10">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-10 h-10 shrink-0 rounded-full bg-black/80 border border-blue-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(10,132,255,0.2)] relative">
                    <Hexagon size={20} className="text-[#0A84FF]" />
                    <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-[spin_4s_linear_infinite]" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl p-5 ${
                  msg.role === "user" 
                    ? "bg-white text-black rounded-tr-sm shadow-xl" 
                    : "glass-card rounded-tl-sm text-slate-200 border-white/5"
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{msg.text}</p>
                </div>

                {msg.role === "user" && (
                  <div className="w-10 h-10 shrink-0 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                    {session?.user?.image ? (
                      <img src={session.user.image} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full bg-black/80 border border-gold/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)] relative">
                <Sparkles size={18} className="text-gold animate-pulse" />
                <div className="absolute inset-0 rounded-full border border-gold/20 animate-[spin_2s_linear_infinite]" />
              </div>
              <div className="glass-card rounded-2xl rounded-tl-sm p-5 flex items-center gap-3">
                <Loader2 className="animate-spin text-gold" size={16} />
                <span className="text-sm text-slate-400 animate-pulse">Running semantic search...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-black/40 backdrop-blur-xl border-t border-white/10 relative z-20">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500 via-violet-500 to-blue-500 rounded-2xl opacity-30 group-focus-within:opacity-100 blur-[2px] transition-opacity duration-300" />
            <div className="relative flex items-center bg-[#0A0A0F] rounded-2xl overflow-hidden border border-white/5 group-focus-within:border-transparent">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Query your legal corpus..."
                className="flex-grow bg-transparent text-white px-6 py-4 outline-none placeholder-slate-500 text-lg"
                disabled={loading}
              />
              <button 
                type="submit" 
                disabled={loading || !query.trim()}
                className="mr-2 p-3 bg-white text-black rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center"
              >
                <Send size={20} className={query.trim() && !loading ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
            </div>
          </form>
          <div className="text-center mt-3 text-xs text-slate-600">
            LawGPT can make mistakes. Consider verifying critical legal information.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
