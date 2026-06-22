"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Cpu, 
  Layers, 
  ShieldAlert, 
  Network, 
  Database, 
  Activity, 
  FileText, 
  CheckCircle,
  FileCode,
  TrendingUp,
  Workflow
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-600 selection:text-white overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-emerald-400 rounded-xl shadow-lg shadow-emerald-900/20">
            <Cpu className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
              FactoryMind <span className="text-emerald-400 font-extrabold font-mono text-xs tracking-wider px-1.5 py-0.5 border border-emerald-500/25 rounded-md bg-emerald-950/40 ml-1">AI</span>
            </span>
            <p className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">Temporal Operations Memory</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
          <a href="#demo" className="hover:text-emerald-400 transition-colors">Operational Demo</a>
          <a href="#metrics" className="hover:text-emerald-400 transition-colors">Impact Metrics</a>
        </nav>

        <div>
          <Link 
            href="/dashboard" 
            className="group relative px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl text-sm transition-all duration-300 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/25 flex items-center space-x-2"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-24 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/30 text-emerald-400 text-xs font-mono mb-8 animate-pulse-border">
          <Activity className="h-3 w-3" />
          <span>Core Innovation: Temporal Operations Memory™</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          FactoryMind AI – The Operational Memory System for Industrial Enterprises
        </h1>

        <p className="mt-6 text-base md:text-xl text-slate-400 max-w-3xl leading-relaxed">
          Transform static industrial documents into a living intelligence layer that detects operational impact before failures occur. Compare revisions, analyze risk, and trace blast radiuses.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/dashboard" 
            className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-300 flex items-center justify-center space-x-3 text-base"
          >
            <span>Launch Enterprise Dashboard</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a 
            href="#demo"
            className="px-8 py-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 font-semibold rounded-xl text-slate-200 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <span>Watch Demo Case</span>
          </a>
        </div>
      </section>

      {/* Product Demo Screenshots / UI Mockups */}
      <section id="demo" className="px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="relative glass-panel rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 md:p-6 shadow-2xl">
          {/* Mock Window Controls */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <span className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="text-xs font-mono text-slate-500 ml-4 select-none">factorymind-copilot-env_01_v2.cfg</span>
            </div>
            <div className="px-3 py-1 rounded bg-slate-950 text-[10px] font-mono text-emerald-400 border border-emerald-500/10">
              ● API ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mock Left: Change Feed */}
            <div className="lg:col-span-1 flex flex-col space-y-4">
              <div className="p-4 rounded-xl border border-red-500/20 bg-slate-950/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl" />
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-red-950 text-red-400 border border-red-500/20 uppercase">Critical Risk</span>
                  <span className="text-[10px] font-mono text-slate-500">SOP-12 v2</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">Safety Checklist Removed</h4>
                <p className="text-xs text-slate-400 mb-3">Manual clearance checklist removed to optimize throughput.</p>
                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
                  <span>Risk Score</span>
                  <span className="text-red-400 font-bold">85/100</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-amber-950 text-amber-400 border border-amber-500/20 uppercase">High Risk</span>
                  <span className="text-[10px] font-mono text-slate-500">SOP-12 v2</span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 mb-1">Inspection Interval Changed</h4>
                <p className="text-xs text-slate-400">Structural check changed from 30 days to 90 days cycle.</p>
              </div>
            </div>

            {/* Mock Middle & Right: Graph and Diff */}
            <div className="lg:col-span-2 flex flex-col space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/40">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center">
                    <Network className="h-4 w-4 text-emerald-400 mr-2" />
                    Blast Radius Dependency Path
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Active Pipeline</span>
                </div>
                
                {/* Horizontal flow mockup */}
                <div className="flex flex-col md:flex-row items-center justify-between py-6 px-4 gap-4 md:gap-2">
                  <div className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-center w-full md:w-auto">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Asset</span>
                    <span className="text-xs font-bold text-slate-300">Compressor-A</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-500 rotate-90 md:rotate-0" />
                  <div className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-center w-full md:w-auto">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Team</span>
                    <span className="text-xs font-bold text-slate-300">Maintenance Team</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-500 rotate-90 md:rotate-0" />
                  <div className="px-3 py-2 rounded-lg border border-emerald-500/30 bg-slate-900 text-center w-full md:w-auto shadow-lg shadow-emerald-950/30">
                    <span className="text-[10px] text-emerald-400 block uppercase font-mono">SOP Reference</span>
                    <span className="text-xs font-bold text-emerald-400">SOP-12 Operations</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-500 rotate-90 md:rotate-0" />
                  <div className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-center w-full md:w-auto">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Compliance</span>
                    <span className="text-xs font-bold text-slate-300">OSHA-1910 Section 5</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-500 rotate-90 md:rotate-0" />
                  <div className="px-3 py-2 rounded-lg border border-slate-800 bg-slate-900 text-center w-full md:w-auto">
                    <span className="text-[10px] text-slate-500 block uppercase font-mono">Schedule</span>
                    <span className="text-xs font-bold text-slate-300">Inspection Plan</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-slate-500 mt-auto bg-slate-950/60 p-2.5 rounded border border-slate-900">
                  <span className="text-red-400 font-bold">WARNING:</span> Editing SOP-12 immediately triggers compliance violations on OSHA-1910 codes and impacts the Inspection Plan assigned to the Maintenance Team for Compressor-A.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="px-6 py-20 bg-slate-950 relative border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              Complete Knowledge Lifecycle Management
            </h2>
            <p className="mt-4 text-slate-400">
              FactoryMind AI doesn't just read documents. It maps operational configurations, computes change drift, and quantifies risk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/35 transition-all duration-300 group">
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/10 text-emerald-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">AI Document Copilot</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload PDFs, DOCXs, or TXT SOPs. Interact via structured chat, extract values instantly, and receive direct source citations mapped to your industrial operations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/35 transition-all duration-300 group">
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/10 text-emerald-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Temporal Change Detection</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Compare document revisions side-by-side. Our risk engine detects changes in inspection intervals, deleted safety checks, and threshold shifts, calculating a precise risk score.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/35 transition-all duration-300 group">
              <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/10 text-emerald-400 w-fit mb-6 group-hover:scale-110 transition-transform">
                <Network className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200 mb-2">Blast Radius Analysis</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Visualize cascading dependencies in an interactive node graph. Instantly identify which assets, departments, compliance rules, and checklists are affected when a procedure changes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section id="metrics" className="px-6 py-16 bg-slate-900/20 border-t border-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tight font-mono text-glow-emerald">
                90%
              </span>
              <span className="block mt-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                Reduction in Safety Risks
              </span>
            </div>
            
            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight font-mono">
                100%
              </span>
              <span className="block mt-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                Compliance Auditing
              </span>
            </div>

            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-slate-100 tracking-tight font-mono">
                35%
              </span>
              <span className="block mt-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                Faster Incident Resolution
              </span>
            </div>

            <div className="text-center">
              <span className="block text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tight font-mono text-glow-emerald">
                0
              </span>
              <span className="block mt-2 text-xs font-mono text-slate-500 uppercase tracking-widest">
                Missed SOP Updates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-200">
          Ready to establish a living operational memory?
        </h2>
        <p className="mt-4 text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Provide your operations team with the predictive intelligence and RAG-based safety copilot needed to eliminate blind spots.
        </p>
        <div className="mt-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center space-x-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 transition-all duration-300 text-base"
          >
            <span>Launch Dashboard Platform</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto px-6 py-8 border-t border-slate-900 text-center text-xs text-slate-600 font-mono">
        <p>© 2026 FactoryMind AI. Built for Industrial Knowledge Intelligence. All rights reserved.</p>
      </footer>
    </div>
  );
}
