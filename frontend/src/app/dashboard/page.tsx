"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";
import { FileUp, MessageSquare, History, Activity, Database, ShieldAlert, Cpu } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8 w-full max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass-panel p-8 rounded-3xl relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-white">
              Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0] || "Counsel"}</span>
            </h1>
            <p className="text-slate-400 text-lg">System operations are nominal. AI retrieval engine is on standby.</p>
          </div>
          
          <div className="relative z-10 flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
            <div className="flex flex-col">
              <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">System Status</span>
              <span className="text-blue-400 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Online & Secure
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Active Documents" 
            value="124" 
            icon={<Database size={20} className="text-slate-300" />} 
            trend="+12 this week"
            delay={0.1}
          />
          <StatCard 
            title="Queries Processed" 
            value="1,492" 
            icon={<Cpu size={20} className="text-slate-300" />} 
            trend="+84 today"
            delay={0.2}
          />
          <StatCard 
            title="Threat Level" 
            value="Zero" 
            icon={<ShieldAlert size={20} className="text-slate-300" />} 
            trend="All systems clear"
            delay={0.3}
          />
        </div>

        <h2 className="text-2xl font-bold mt-4 mb-2 flex items-center gap-2 text-white">
          <Activity className="text-purple-400" /> Quick Actions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard 
            href="/upload"
            icon={<FileUp size={28} className="text-white" />}
            title="Ingest Data"
            desc="Upload new legal PDFs to the vector database."
            delay={0.4}
          />
          <ActionCard 
            href="/research"
            icon={<MessageSquare size={28} className="text-white" />}
            title="Launch Research"
            desc="Query the neural network for exact precedents."
            delay={0.5}
          />
          <ActionCard 
            href="/history"
            icon={<History size={28} className="text-white" />}
            title="Audit Logs"
            desc="Review cryptographic logs of past interactions."
            delay={0.6}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, icon, trend, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card p-6 flex flex-col justify-between h-40 group"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
        <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:bg-white/10 transition-colors">{icon}</div>
      </div>
      <div>
        <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
        <div className="text-xs text-slate-500 mt-2 uppercase tracking-wider">{trend}</div>
      </div>
    </motion.div>
  );
}

function ActionCard({ href, icon, title, desc, delay }: any) {
  return (
    <Link href={href}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="h-full glass-card p-6 flex flex-col items-start gap-4 group hover:bg-white/5"
      >
        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-500/20 group-hover:border-blue-500/50 group-hover:text-blue-400 transition-all duration-300">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{title}</h3>
          <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </motion.div>
    </Link>
  );
}
