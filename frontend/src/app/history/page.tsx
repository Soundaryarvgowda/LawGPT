"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { History as HistoryIcon, Clock, MessageSquare, Search, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type HistoryItem = {
  _id: string;
  query: string;
  response: string;
  created_at: string;
};

export default function HistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = (session as any)?.accessToken;
        if (!token) return;
        
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://lawgpt-e16g.onrender.com"}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    
    if (session) {
      fetchHistory();
    }
  }, [session]);

  const filteredHistory = history.filter(item => 
    item.query.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.response.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 py-4 text-white">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight flex items-center gap-3">
              <HistoryIcon className="text-purple-400" size={32} /> Audit Logs
            </h1>
            <p className="text-slate-400">Cryptographic record of all AI interactions.</p>
          </div>
          
          <div className="relative w-full md:w-64">
            <div className="relative flex items-center bg-black border border-white/10 rounded-xl px-4 py-2 cyber-input focus-within:border-purple-500 transition-colors">
              <Search size={18} className="text-slate-500" />
              <input 
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-white px-3 w-full text-sm"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col gap-4 mt-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card h-32 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : (
          <div className="relative mt-8">
            {/* Timeline Line */}
            <div className="absolute left-[27px] top-4 bottom-4 w-px bg-gradient-to-b from-blue-500/50 via-purple-500/30 to-transparent hidden md:block" />
            
            <AnimatePresence>
              {filteredHistory.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-panel p-12 rounded-3xl flex flex-col items-center text-center gap-4"
                >
                  <div className="p-4 bg-white/5 rounded-full mb-2 border border-white/10">
                    <Search size={40} className="text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white">No records found</h3>
                  <p className="text-slate-400">Try adjusting your search criteria or start a new research session.</p>
                </motion.div>
              ) : (
                <div className="flex flex-col gap-8">
                  {filteredHistory.map((item, idx) => (
                    <motion.div 
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative flex items-start gap-8 group"
                    >
                      {/* Timeline Dot */}
                      <div className="hidden md:flex mt-6 w-14 h-14 shrink-0 rounded-full bg-black border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)] items-center justify-center relative z-10 group-hover:border-blue-500 transition-colors">
                        <MessageSquare size={20} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
                        <div className="absolute inset-[-4px] rounded-full border border-transparent group-hover:border-blue-500/30 transition-colors" />
                      </div>
                      
                      {/* Content Card */}
                      <div className="glass-card w-full p-6 relative group-hover:border-white/20">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                            <Clock size={14} className="text-blue-400" />
                            {new Date(item.created_at).toLocaleString()}
                          </div>
                          <button className="text-slate-600 hover:text-white transition-colors">
                            <ChevronRight size={20} />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-xs text-slate-500 uppercase font-bold mb-1">User Query</h4>
                            <p className="text-white font-medium text-lg leading-relaxed">{item.query}</p>
                          </div>
                          
                          <div className="h-px w-full bg-white/10" />
                          
                          <div>
                            <h4 className="text-xs text-slate-500 uppercase font-bold mb-1 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(138,43,226,0.8)]"></span> AI Analysis
                            </h4>
                            <p className="text-slate-300 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">{item.response}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
