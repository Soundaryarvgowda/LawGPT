"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileUp, MessageSquare, History, LayoutDashboard, ChevronRight } from "lucide-react";
import ProtectedRoute from "./ProtectedRoute";
import { motion, Variants } from "framer-motion";

const sidebarVariants: Variants = {
  hidden: { x: -300, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20, staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: <LayoutDashboard size={20} /> },
    { href: "/upload", label: "Corpus Upload", icon: <FileUp size={20} /> },
    { href: "/research", label: "AI Research", icon: <MessageSquare size={20} /> },
    { href: "/history", label: "Audit Log", icon: <History size={20} /> },
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] w-full max-w-7xl mx-auto px-4 py-8 gap-8 relative z-10">
        
        {/* Animated Sidebar */}
        <motion.aside 
          variants={sidebarVariants}
          initial="hidden"
          animate="visible"
          className="w-full md:w-72 shrink-0 flex flex-col gap-2"
        >
          <div className="glass-panel p-6 rounded-2xl sticky top-28 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Control Panel</h2>
            <nav className="flex flex-col gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div key={link.href} variants={itemVariants}>
                    <Link 
                      href={link.href} 
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? "bg-gradient-to-r from-[rgba(10,132,255,0.2)] to-[rgba(138,43,226,0.2)] text-white border border-[rgba(255,255,255,0.1)] shadow-lg" 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3 font-medium">
                        <span className={isActive ? "text-[#0A84FF]" : "group-hover:text-violet-400 transition-colors"}>
                          {link.icon}
                        </span>
                        {link.label}
                      </div>
                      {isActive && (
                        <motion.div layoutId="active-pill">
                          <ChevronRight size={16} className="text-white/50" />
                        </motion.div>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-grow w-full"
        >
          {children}
        </motion.div>
        
      </div>
    </ProtectedRoute>
  );
}
