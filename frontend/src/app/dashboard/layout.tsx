"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  MessageSquareCode, 
  GitCompare, 
  Workflow, 
  Cpu, 
  Activity, 
  AlertCircle,
  Menu,
  X
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [apiStatus, setApiStatus] = useState<"connecting" | "online" | "offline">("connecting");

  // Check backend server connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard");
        if (res.ok) {
          setApiStatus("online");
        } else {
          setApiStatus("offline");
        }
      } catch (e) {
        setApiStatus("offline");
      }
    };
    checkConnection();
    // Poll every 10 seconds
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Overview metrics & active risks"
    },
    {
      name: "AI Document Copilot",
      href: "/dashboard/copilot",
      icon: MessageSquareCode,
      description: "Chat & document upload"
    },
    {
      name: "Change Detection",
      href: "/dashboard/compare",
      icon: GitCompare,
      description: "SOP revision comparisons"
    },
    {
      name: "Blast Radius",
      href: "/dashboard/blast-radius",
      icon: Workflow,
      description: "Dependency mapping graph"
    }
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-950/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-950/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 glass-panel border-r border-slate-900 flex flex-col z-30 shrink-0`}
      >
        {/* Sidebar Brand Logo */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 overflow-hidden">
            <div className="p-2 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-lg shrink-0">
              <Cpu className="h-5 w-5 text-slate-950" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="font-bold tracking-tight text-slate-200 block text-sm">
                  FactoryMind <span className="text-emerald-400 font-mono text-[9px] border border-emerald-500/30 px-1 py-0.5 rounded bg-emerald-950/30">AI</span>
                </span>
                <span className="text-[8px] text-slate-500 tracking-wider uppercase font-mono block">Enterprise Memory</span>
              </div>
            )}
          </Link>
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-950/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400"
                }`} />
                {isSidebarOpen && (
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-xs font-semibold tracking-wide">{item.name}</span>
                    <span className="text-[9px] text-slate-500 font-mono truncate">{item.description}</span>
                  </div>
                )}
                {/* Active glow indicator */}
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-6 bg-emerald-400 rounded-full blur-[1px] shadow-lg shadow-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Connection status footer */}
        <div className="p-4 border-t border-slate-900 flex items-center space-x-3">
          <div className="relative flex">
            {apiStatus === "online" && (
              <>
                <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </>
            )}
            {apiStatus === "offline" && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            )}
            {apiStatus === "connecting" && (
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 animate-pulse" />
            )}
          </div>
          {isSidebarOpen && (
            <div className="text-left font-mono">
              <p className="text-[10px] text-slate-400 font-semibold uppercase">API Server</p>
              <p className={`text-[8px] uppercase tracking-widest ${
                apiStatus === "online" ? "text-emerald-400" : apiStatus === "offline" ? "text-red-400" : "text-amber-400"
              }`}>
                {apiStatus === "online" ? "Online" : apiStatus === "offline" ? "Offline (Check CMD)" : "Connecting..."}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="glass-panel border-b border-slate-900 px-6 py-4 flex items-center justify-between bg-slate-950/65 shrink-0 z-10">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-500 font-mono">FACTORYMIND_OS /</span>
            <span className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              {navItems.find(item => pathname === item.href)?.name || "Operational Center"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-400">
              <Activity className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-mono uppercase tracking-widest">Active Database: SQLite</span>
            </div>
            
            {apiStatus === "offline" && (
              <div className="flex items-center space-x-1.5 bg-red-950/40 border border-red-500/20 rounded-lg px-2.5 py-1 text-[10px] text-red-400 font-mono animate-pulse">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Backend offline - Run run.ps1</span>
              </div>
            )}
          </div>
        </header>

        {/* Content Router Outlet */}
        <main className="flex-1 overflow-y-auto bg-slate-950/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
