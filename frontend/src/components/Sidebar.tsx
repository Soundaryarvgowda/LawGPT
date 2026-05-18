"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileUp, MessageSquare, History } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  
  const links = [
    { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Upload PDF", href: "/upload", icon: <FileUp size={20} /> },
    { name: "Legal Chat", href: "/research", icon: <MessageSquare size={20} /> },
    { name: "History", href: "/history", icon: <History size={20} /> },
  ];

  return (
    <aside className="w-64 glass border-r border-slate-800 min-h-[calc(100vh-80px)] flex flex-col p-4 hidden md:flex">
      <div className="flex flex-col gap-2 mt-4">
        {links.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === link.href ? "bg-gold/20 text-gold font-bold border border-gold/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
