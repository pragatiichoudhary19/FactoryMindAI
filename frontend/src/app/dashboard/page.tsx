"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  Cpu, 
  ShieldAlert, 
  Workflow, 
  TrendingUp, 
  Clock, 
  Upload, 
  ArrowRight,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

interface DashboardData {
  metrics: {
    total_documents: number;
    total_assets: number;
    compliance_score: number;
    active_risks: number;
  };
  category_counts: Record<string, number>;
  risk_distribution: Array<{ name: string; value: number }>;
  recent_uploads: Array<{
    document_id: number;
    document_name: string;
    category: string;
    version: number;
    filename: string;
    uploaded_at: string;
  }>;
  recent_changes: Array<{
    id: number;
    document_name: string;
    version_a: number;
    version_b: number;
    risk_score: number;
    risk_level: string;
    change_summary: string;
    created_at: string;
  }>;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]; // Low (Emerald), Medium (Blue), High (Amber), Critical (Red)

// Mock Fallback Data (exactly matching seed data results)
const mockData: DashboardData = {
  metrics: {
    total_documents: 100,
    total_assets: 50,
    compliance_score: 94,
    active_risks: 1
  },
  category_counts: {
    "SOP": 20,
    "Maintenance Log": 20,
    "Inspection Report": 20,
    "Incident Report": 20,
    "Compliance Record": 20
  },
  risk_distribution: [
    { name: "Low", value: 99 },
    { name: "Medium", value: 0 },
    { name: "High", value: 0 },
    { name: "Critical", value: 1 }, // SOP-12
  ],
  recent_uploads: [
    {
      document_id: 12,
      document_name: "SOP-12 Compressor Operations",
      category: "SOP",
      version: 2,
      filename: "SOP_v2.pdf",
      uploaded_at: "2026-06-01 10:45:00"
    },
    {
      document_id: 12,
      document_name: "SOP-12 Compressor Operations",
      category: "SOP",
      version: 1,
      filename: "SOP_v1.pdf",
      uploaded_at: "2025-01-15 08:30:00"
    },
    {
      document_id: 1,
      document_name: "ML-01 Maintenance Record - Pump-101",
      category: "Maintenance Log",
      version: 1,
      filename: "maintenance_log_1_v1.txt",
      uploaded_at: "2026-03-12 12:00:00"
    }
  ],
  recent_changes: [
    {
      id: 1,
      document_name: "SOP-12 Compressor Operations",
      version_a: 1,
      version_b: 2,
      risk_score: 88,
      risk_level: "Critical",
      change_summary: "This revision increases the compressor structural inspection interval from 30 days to 90 days. Critically, the safety checklist mandatory requirement before compressor startup has been removed to optimize throughput. This represents severe operational hazards regarding heat buildup, oil starvation, and safety compliance.",
      created_at: "2026-06-01 10:46:00"
    }
  ]
};

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData>(mockData);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/dashboard");
        if (res.ok) {
          const fetchedJson = await res.json();
          setData(fetchedJson);
          setIsOffline(false);
        } else {
          setIsOffline(true);
        }
      } catch (e) {
        setIsOffline(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const barData = Object.entries(data.category_counts).map(([name, value]) => ({
    name,
    count: value
  }));

  return (
    <div className="space-y-6">
      {/* Offline Alert Badge */}
      {isOffline && (
        <div className="flex items-center space-x-2 bg-amber-950/20 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl text-xs font-mono">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Using Local Simulation Cache. Start the FastAPI server using uvicorn or the run script to sync live modifications.</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Total Documents</span>
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3 font-mono">{data.metrics.total_documents}</p>
          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center">
            <span>SOPs, logs, reports & rules</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Monitored Assets</span>
            <Cpu className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-slate-100 mt-3 font-mono">{data.metrics.total_assets}</p>
          <div className="mt-2 text-[10px] text-emerald-400 font-mono flex items-center">
            <span className="text-glow-emerald">● 100% covered</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-xl p-5 relative overflow-hidden group hover:border-slate-800 transition-all">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">Compliance Score</span>
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3 font-mono text-glow-emerald">{data.metrics.compliance_score}%</p>
          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center">
            <span>vs regulation baseline</span>
          </div>
        </div>
      </div>
        {/* Metric 4 */}
        <div className="glass-panel rounded-xl p-5 border border-red-500/10 hover:border-red-500/20 transition-all relative overflow-hidden group">
  <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-xl" />
  <div className="flex items-center justify-between">
    <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">
      Active Risks
    </span>
    <ShieldAlert className="h-5 w-5 text-red-500" />
  </div>

  <p
    className={`text-3xl font-extrabold mt-3 font-mono ${
      data.metrics.active_risks > 0
        ? "text-red-500 text-glow-red"
        : "text-slate-100"
    }`}
  >
    {data.metrics.active_risks}
  </p>

  <div className="mt-2 text-[10px] text-red-400 font-mono flex items-center">
    <span>Critical changes detected</span>
  </div>
</div>

      {/* Main Charts & Feeds Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recharts Charts */}
        <div className="lg:col-span-2 space-y-6 flex flex-col">
          {/* Risk Distribution & Document Types Side-By-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart Widget */}
            <div className="glass-panel rounded-xl p-5 flex flex-col h-72">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Risk Distribution</span>
              <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.risk_distribution.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.risk_distribution.filter(d => d.value > 0).map((entry, index) => {
                        const originalIndex = data.risk_distribution.findIndex(r => r.name === entry.name);
                        return <Cell key={`cell-${index}`} fill={COLORS[originalIndex % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                      itemStyle={{ color: "#f3f4f6" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">Total Risks</span>
                  <span className="text-xl font-bold font-mono text-slate-200">
                    {data.risk_distribution.reduce((acc, d) => acc + d.value, 0)}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-mono mt-3 border-t border-slate-900 pt-3">
                {data.risk_distribution.map((d, index) => (
                  <div key={d.name} className="flex flex-col">
                    <span className="font-bold" style={{ color: COLORS[index] }}>{d.name}</span>
                    <span className="text-slate-400 mt-0.5">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bar Chart Widget */}
            <div className="glass-panel rounded-xl p-5 flex flex-col h-72">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Document Repositories</span>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ left: -25, right: 10, bottom: 0, top: 10 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={8} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={8} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                      itemStyle={{ color: "#f3f4f6" }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, idx) => (
                        <Cell key={`bar-cell-${idx}`} fill="#059669" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Change Detection Feed */}
          <div className="glass-panel rounded-xl p-5 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Clock className="h-4 w-4 text-emerald-400 mr-2" />
                Change Detection Feed
              </span>
              <Link href="/dashboard/compare" className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center">
                Compare Revisions <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 max-h-[360px] pr-1">
              {data.recent_changes.map((change) => (
                <div 
                  key={change.id} 
                  className={`p-4 rounded-xl border relative ${
                    change.risk_level === "Critical" 
                      ? "border-red-500/20 bg-red-950/5" 
                      : change.risk_level === "High"
                      ? "border-amber-500/20 bg-amber-950/5"
                      : "border-slate-800 bg-slate-900/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{change.document_name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        Revision Compare: v{change.version_a} → v{change.version_b} | Evaluated {change.created_at}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${
                        change.risk_level === "Critical" 
                          ? "bg-red-950 text-red-400 border border-red-500/20" 
                          : change.risk_level === "High"
                          ? "bg-amber-950 text-amber-400 border border-amber-500/20"
                          : "bg-slate-900 text-slate-400"
                      }`}>
                        {change.risk_level}
                      </span>
                      <p className="text-xs font-mono font-bold text-slate-300 mt-1">Score: {change.risk_score}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2.5">
                    {change.change_summary}
                  </p>
                  
                  {/* Blast radius button overlay */}
                  <div className="mt-4 flex justify-end">
                    <Link 
                      href="/dashboard/blast-radius"
                      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 hover:text-emerald-400 transition-all rounded"
                    >
                      <Workflow className="h-3 w-3 text-emerald-400" />
                      <span>Trace Blast Radius</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Recent Uploads & AI Quick Panel */}
        <div className="space-y-6 flex flex-col">
          {/* Recent Uploads Feed */}
          <div className="glass-panel rounded-xl p-5 flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                <Upload className="h-4 w-4 text-emerald-400 mr-2" />
                Recent Uploads
              </span>
              <Link href="/dashboard/copilot" className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center">
                Upload Files <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {data.recent_uploads.map((up, idx) => (
                <div key={`${up.document_id}-${up.version}-${idx}`} className="flex items-center justify-between p-3 rounded-lg border border-slate-900 bg-slate-950/40 hover:border-slate-800 transition-colors">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded">
                      <FileText className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-300 truncate">{up.document_name}</p>
                      <p className="text-[9px] font-mono text-slate-500">v{up.version} • {up.category}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 tracking-tighter shrink-0">{up.uploaded_at.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant panel preview */}
          <div className="glass-panel rounded-xl p-5 border border-emerald-500/10 flex-1 flex flex-col min-h-[300px]">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4 border-b border-slate-900 pb-3">
              Operational Memory Agent
            </span>
            <div className="flex-1 flex flex-col justify-center items-center text-center p-4">
              <div className="w-12 h-12 bg-emerald-950/60 rounded-full border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
                <Cpu className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-300 mb-1">RAG Document Intelligence</h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
                Search for procedures, incident histories, or emission rules across all 100 seeded documents.
              </p>
              
              <div className="w-full mt-6 space-y-2 text-left">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Example Queries</p>
                <Link 
                  href="/dashboard/copilot?q=What+is+the+maintenance+procedure+for+Pump-101%3F"
                  className="block p-2 text-xs rounded border border-slate-900 bg-slate-950/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all font-mono"
                >
                  "What is the maintenance procedure for Pump-101?"
                </Link>
                <Link 
                  href="/dashboard/copilot?q=Show+all+incidents+related+to+Boiler-5.%3F"
                  className="block p-2 text-xs rounded border border-slate-900 bg-slate-950/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all font-mono"
                >
                  "Show all incidents related to Boiler-05."
                </Link>
              </div>

              <Link 
                href="/dashboard/copilot"
                className="mt-6 w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors shadow-md shadow-emerald-500/10"
              >
                <span>Launch Chat Copilot</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
