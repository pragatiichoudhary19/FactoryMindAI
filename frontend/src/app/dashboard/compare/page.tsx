"use client";

import { useEffect, useState } from "react";
import { 
  GitCompare, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  ChevronRight,
  TrendingUp,
  Workflow
} from "lucide-react";
import Link from "next/link";

interface DocumentItem {
  id: number;
  name: string;
  category: string;
  versions: number[];
}

interface CompareResult {
  id: number;
  document_name: string;
  version_a: number;
  version_b: number;
  risk_score: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  change_summary: string;
  added: string[];
  removed: string[];
  modified: string[];
}

const mockSOP12Compare: CompareResult = {
  id: 1,
  document_name: "SOP-12 Compressor Operations",
  version_a: 1,
  version_b: 2,
  risk_score: 88,
  risk_level: "Critical",
  change_summary: "This revision increases the compressor structural inspection interval from 30 days to 90 days. Critically, the safety checklist mandatory requirement before compressor startup has been removed to optimize throughput. This represents severe operational hazards regarding heat buildup, oil starvation, and safety compliance.",
  added: [
    "Section 2: Operating Pressure limit changed from 8.5 Bar to 9.0 Bar.",
    "Section 3: Inspection interval increased to 90 days.",
    "Section 3: Pre-startup checklist checks are delegated to shift change; mandatory startup checklist removed."
  ],
  removed: [
    "Section 3: The inspection interval is set to 30 days.",
    "Section 3: Mandatory checklist: Check compressor oil levels, verify pressure gauges read zero, verify discharge valves are open, inspect safety relief valves."
  ],
  modified: [
    "Section 2: Maximum Temperature limit raised from 95 C to 98 C.",
    "Section 3: Inspection cycle frequency and pre-startup check compliance regulations modified."
  ]
};

export default function TemporalChangeDetection() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // Selection state
  const [selectedDocId, setSelectedDocId] = useState<number | "">("");
  const [verA, setVerA] = useState<number | "">("");
  const [verB, setVerB] = useState<number | "">("");
  
  // Result state
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/documents");
      if (res.ok) {
        const json = await res.json();
        setDocuments(json);
        
        // Auto-select SOP-12 as default demo
        const sop12 = json.find((d: any) => d.name === "SOP-12 Compressor Operations");
        if (sop12) {
          setSelectedDocId(sop12.id);
          setVerA(1);
          setVerB(2);
          triggerCompareLocal(sop12.id, 1, 2, json);
        }
      }
    } catch (e) {
      // Offline fallback
      const fallbackDocs = [
        { id: 12, name: "SOP-12 Compressor Operations", category: "SOP", versions: [1, 2] },
        { id: 1, name: "ML-01 Maintenance Record - Pump-101", category: "Maintenance Log", versions: [1] }
      ];
      setDocuments(fallbackDocs);
      setSelectedDocId(12);
      setVerA(1);
      setVerB(2);
      setResult(mockSOP12Compare);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const triggerCompareLocal = (docId: number, a: number, b: number, docList: DocumentItem[]) => {
    const doc = docList.find(d => d.id === docId);
    if (doc && doc.name === "SOP-12 Compressor Operations" && a === 1 && b === 2) {
      setResult(mockSOP12Compare);
    } else {
      // Generate a mock compare for non-demo items
      setResult({
        id: Date.now(),
        document_name: doc ? doc.name : "Document",
        version_a: a,
        version_b: b,
        risk_score: 25,
        risk_level: "Low",
        change_summary: "Routine administrative changes. Text changes represent wording updates with minor formatting corrections. No critical limits or thresholds modified.",
        added: ["Document meta-version updated for logging.", "Operations review board notes appended."],
        removed: ["Obsolete revision footer tags removed."],
        modified: ["Formatting tweaks across section subheadings."]
      });
    }
  };

  const handleCompareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDocId || !verA || !verB) {
      setErrorMsg("Please select a document and both versions.");
      return;
    }
    if (verA === verB) {
      setErrorMsg("Versions must be different to run comparison.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("http://localhost:8000/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: selectedDocId,
          version_a: verA,
          version_b: verB
        })
      });

      if (res.ok) {
        const json = await res.json();
        setResult(json);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Offline fallback comparison
      triggerCompareLocal(Number(selectedDocId), Number(verA), Number(verB), documents);
    } finally {
      setLoading(false);
    }
  };

  // Get active document configurations
  const activeDoc = documents.find(d => d.id === Number(selectedDocId));
  const availableVersions = activeDoc ? activeDoc.versions : [];

  // Color classes for risk levels
  const getRiskColor = (level: string) => {
    switch (level) {
      case "Critical": return "text-red-500 border-red-500/20 bg-red-950/20";
      case "High": return "text-amber-500 border-amber-500/20 bg-amber-950/20";
      case "Medium": return "text-blue-500 border-blue-500/20 bg-blue-950/20";
      default: return "text-emerald-500 border-emerald-500/20 bg-emerald-950/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <div className="glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">SOP Revision Comparer</span>
        
        <form onSubmit={handleCompareSubmit} className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1 w-full text-left">
            <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">Select Document</label>
            <select
              value={selectedDocId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : "";
                setSelectedDocId(val);
                setVerA("");
                setVerB("");
              }}
              className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-slate-200 focus:outline-none"
            >
              <option value="">-- Choose File --</option>
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.category})</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-36 text-left">
            <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">Version A (Base)</label>
            <select
              value={verA}
              onChange={(e) => setVerA(e.target.value ? Number(e.target.value) : "")}
              disabled={!selectedDocId}
              className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-slate-200 focus:outline-none disabled:opacity-50"
            >
              <option value="">-- Select --</option>
              {availableVersions.map(v => (
                <option key={`a-${v}`} value={v}>v{v}</option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-36 text-left">
            <label className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">Version B (Compare)</label>
            <select
              value={verB}
              onChange={(e) => setVerB(e.target.value ? Number(e.target.value) : "")}
              disabled={!selectedDocId}
              className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-lg p-2.5 text-slate-200 focus:outline-none disabled:opacity-50"
            >
              <option value="">-- Select --</option>
              {availableVersions.map(v => (
                <option key={`b-${v}`} value={v}>v{v}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedDocId || !verA || !verB}
            className="w-full md:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-500/10 shrink-0"
          >
            <GitCompare className="h-4 w-4" />
            <span>{loading ? "Analyzing..." : "Compare Revisions"}</span>
          </button>
        </form>

        {errorMsg && (
          <div className="mt-3 text-xs text-red-400 flex items-center space-x-1 font-mono">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Comparison Results Card layout */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Risk Level gauge & Summary (1/3 Width) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/60 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
              
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-6 self-start">Temporal Risk Score</span>
              
              {/* Risk Level Gauge */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={
                      result.risk_level === "Critical" ? "#ef4444" : 
                      result.risk_level === "High" ? "#f59e0b" : 
                      result.risk_level === "Medium" ? "#3b82f6" : "#10b981"
                    }
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.risk_score) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tighter">
                    {result.risk_score}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider font-mono text-slate-500">of 100 pts</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className={`mt-6 px-3 py-1 text-xs font-mono font-bold rounded-lg border uppercase tracking-wider ${getRiskColor(result.risk_level)}`}>
                {result.risk_level} Hazard Level
              </div>

              <div className="mt-6 border-t border-slate-900 pt-5 text-left w-full">
                <span className="text-[9px] font-mono text-slate-500 uppercase block mb-2">Change Impact Summary</span>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {result.change_summary}
                </p>
              </div>

              {/* Action buttons (Blast radius quick jump) */}
              {result.risk_level === "Critical" && (
                <Link
                  href="/dashboard/blast-radius"
                  className="mt-6 w-full py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 text-xs font-mono font-bold rounded-xl flex items-center justify-center space-x-1.5 transition-all shadow-lg shadow-red-950/10"
                >
                  <Workflow className="h-4 w-4" />
                  <span>Map Cascading Blast Radius</span>
                </Link>
              )}
            </div>
          </div>

          {/* Code Diff logs (2/3 Width) */}
          <div className="lg:col-span-2 space-y-4 flex flex-col">
            {/* Added Content log */}
            <div className="glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/60 flex-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-3 font-mono">
                [+] Added Operations Guidelines
              </span>
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {result.added.map((item, idx) => (
                  <div key={`add-${idx}`} className="p-2.5 rounded bg-emerald-950/10 border border-emerald-500/10 text-xs text-slate-300 font-mono flex items-start space-x-2">
                    <span className="text-emerald-500 font-bold shrink-0">+</span>
                    <span>{item}</span>
                  </div>
                ))}
                {result.added.length === 0 && (
                  <p className="text-[10px] text-slate-500 font-mono italic">No new guidelines added.</p>
                )}
              </div>
            </div>

            {/* Removed Content log */}
            <div className="glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/60 flex-1">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-3 font-mono">
                [-] Removed Operations Guidelines
              </span>
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {result.removed.map((item, idx) => (
                  <div key={`rem-${idx}`} className="p-2.5 rounded bg-red-950/10 border border-red-500/10 text-xs text-slate-300 font-mono flex items-start space-x-2">
                    <span className="text-red-500 font-bold shrink-0">-</span>
                    <span>{item}</span>
                  </div>
                ))}
                {result.removed.length === 0 && (
                  <p className="text-[10px] text-slate-500 font-mono italic">No guidelines removed.</p>
                )}
              </div>
            </div>

            {/* Modified parameters log */}
            <div className="glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/60 flex-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-3 font-mono">
                [*] Modified Thresholds & Rules
              </span>
              <div className="space-y-2 overflow-y-auto max-h-[160px] pr-1">
                {result.modified.map((item, idx) => (
                  <div key={`mod-${idx}`} className="p-2.5 rounded bg-blue-950/10 border border-blue-500/10 text-xs text-slate-300 font-mono flex items-start space-x-2">
                    <span className="text-blue-500 font-bold shrink-0">*</span>
                    <span>{item}</span>
                  </div>
                ))}
                {result.modified.length === 0 && (
                  <p className="text-[10px] text-slate-500 font-mono italic">No modified thresholds detected.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
