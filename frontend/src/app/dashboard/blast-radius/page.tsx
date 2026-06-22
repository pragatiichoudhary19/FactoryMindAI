"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  Panel,
  useNodesState, 
  useEdgesState,
  Handle,
  Position
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { 
  Cpu, 
  Users, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Activity, 
  AlertTriangle,
  Info,
  Calendar
} from "lucide-react";

interface NodeData {
  id: string;
  label: string;
  type: string;
  description: string;
  status: string;
  onSelectNode: (data: any) => void;
}

// Custom Node Component for React Flow
const CustomNode = ({ data }: { data: NodeData }) => {
  const { label, type, description, status } = data;
  
  const getIcon = () => {
    switch (type) {
      case "asset": return <Cpu className="h-4 w-4 text-blue-400" />;
      case "team": return <Users className="h-4 w-4 text-emerald-400" />;
      case "document": return <FileText className="h-4 w-4 text-purple-400" />;
      case "compliance": return <ShieldAlert className="h-4 w-4 text-amber-400" />;
      case "schedule": return <Calendar className="h-4 w-4 text-pink-400" />;
      default: return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    if (status === "Maintenance Required" || status === "offline") return "bg-amber-500";
    if (status === "Operational" || status === "active") return "bg-emerald-500";
    if (status === "Offline" || status === "critical") return "bg-red-500";
    return "bg-slate-700";
  };

  return (
    <div 
      onClick={() => data.onSelectNode(data)}
      className="glass-panel hover:border-emerald-500/40 cursor-pointer rounded-xl p-3.5 w-60 text-left transition-all duration-200 shadow-xl border border-slate-800/80 bg-slate-900/90 relative"
    >
      {/* Handles */}
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-emerald-500" />
      
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{type}</span>
          <h4 className="text-xs font-bold text-slate-200 truncate mt-0.5">{label}</h4>
          <p className="text-[10px] text-slate-500 truncate mt-1">{description}</p>
        </div>
      </div>
      
      {/* Status indicator bar */}
      <div className="absolute top-3.5 right-3.5 flex items-center space-x-1">
        <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor()}`} />
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-emerald-500" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Preset demo layout mapping
const defaultNodes = [
  {
    id: "Compressor-A",
    type: "custom",
    position: { x: 50, y: 150 },
    data: { id: "Compressor-A", label: "Compressor-A", type: "asset", description: "Criticality: Critical | Dept: Maintenance", status: "Operational" }
  },
  {
    id: "Maintenance Team",
    type: "custom",
    position: { x: 330, y: 150 },
    data: { id: "Maintenance Team", label: "Maintenance Team", type: "team", description: "Responsible Team", status: "active" }
  },
  {
    id: "SOP-12 Compressor Operations",
    type: "custom",
    position: { x: 610, y: 150 },
    data: { id: "SOP-12 Compressor Operations", label: "SOP-12 Compressor Operations", type: "document", description: "Industrial Document Record", status: "critical" }
  },
  {
    id: "Compliance Rule",
    type: "custom",
    position: { x: 890, y: 150 },
    data: { id: "Compliance Rule", label: "Compliance Rule", type: "compliance", description: "Regulatory Compliance Rule", status: "critical" }
  },
  {
    id: "Inspection Schedule",
    type: "custom",
    position: { x: 1170, y: 150 },
    data: { id: "Inspection Schedule", label: "Inspection Schedule", type: "schedule", description: "Asset Maintenance Schedule", status: "critical" }
  },
  
  // Other branches (Boiler-05)
  {
    id: "Boiler-05",
    type: "custom",
    position: { x: 50, y: 350 },
    data: { id: "Boiler-05", label: "Boiler-05", type: "asset", description: "Criticality: High | Dept: Operations", status: "Maintenance Required" }
  },
  {
    id: "Operations Team",
    type: "custom",
    position: { x: 330, y: 350 },
    data: { id: "Operations Team", label: "Operations Team", type: "team", description: "Responsible Team", status: "active" }
  },
  {
    id: "Boiler SOP-05",
    type: "custom",
    position: { x: 610, y: 350 },
    data: { id: "Boiler SOP-05", label: "Boiler SOP-05", type: "document", description: "Industrial Document Record", status: "active" }
  }
];

const defaultEdges = [
  { id: "e-0", source: "Compressor-A", target: "Maintenance Team", animated: true, className: "edge-animated stroke-emerald-500" },
  { id: "e-1", source: "Maintenance Team", target: "SOP-12 Compressor Operations", animated: true, className: "edge-animated stroke-emerald-500" },
  { id: "e-2", source: "SOP-12 Compressor Operations", target: "Compliance Rule", animated: true, className: "edge-animated stroke-red-500" },
  { id: "e-3", source: "Compliance Rule", target: "Inspection Schedule", animated: true, className: "edge-animated stroke-red-500" },
  
  { id: "e-4", source: "Boiler-05", target: "Operations Team", animated: false },
  { id: "e-5", source: "Operations Team", target: "Boiler SOP-05", animated: false }
];

export default function BlastRadiusAnalysis() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);

  // Set selected node details in sidebar
  const handleSelectNode = useCallback((nodeData: any) => {
    setSelectedNode(nodeData);
  }, []);

  const fetchDependencies = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/dependencies");
      if (res.ok) {
        const json = await res.json();
        
        // Dynamic Node Layout mapping
        // Column groups: asset -> team -> document -> compliance -> schedule
        const columnX = { asset: 50, team: 330, document: 610, compliance: 890, schedule: 1170 };
        const counts: Record<string, number> = {};

        const formattedNodes = json.nodes.map((node: any) => {
          const type = node.type || "unknown";
          counts[type] = (counts[type] || 0) + 1;
          
          // Compute Y offset to prevent overlap
          const yOffset = (counts[type] - 1) * 150 + 150;
          
          return {
            id: node.id,
            type: "custom",
            position: { x: columnX[type as keyof typeof columnX] || 200, y: yOffset },
            data: {
              ...node,
              onSelectNode: handleSelectNode
            }
          };
        });

        // Add class overrides for animated critical paths
        const formattedEdges = json.edges.map((edge: any) => {
          const isDemoPath = ["Compressor-A", "Maintenance Team", "SOP-12 Compressor Operations", "Compliance Rule", "Inspection Schedule"].includes(edge.source) &&
                             ["Compressor-A", "Maintenance Team", "SOP-12 Compressor Operations", "Compliance Rule", "Inspection Schedule"].includes(edge.target);
          return {
            ...edge,
            animated: isDemoPath,
            className: isDemoPath 
              ? (["SOP-12 Compressor Operations", "Compliance Rule", "Inspection Schedule"].includes(edge.source) 
                 ? "edge-animated stroke-red-500" 
                 : "edge-animated stroke-emerald-500")
              : "stroke-slate-800"
          };
        });

        setNodes(formattedNodes);
        setEdges(formattedEdges);
        
        // Auto select Compressor-A as initial inspector
        const compANode = json.nodes.find((n: any) => n.id === "Compressor-A");
        if (compANode) setSelectedNode(compANode);
        
        setIsOffline(false);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Offline fallback
      setIsOffline(true);
      const formattedNodes = defaultNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onSelectNode: handleSelectNode
        }
      }));
      setNodes(formattedNodes as any);
      setEdges(defaultEdges);
      setSelectedNode(defaultNodes[0].data);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, [handleSelectNode]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] overflow-hidden">
      {/* Left panel - Full Screen React Flow Graph (3/4 Width) */}
      <div className="flex-1 glass-panel rounded-xl border border-slate-900 bg-slate-950/60 overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono flex items-center space-x-2 backdrop-blur">
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>Interactive Blast Radius Diagram</span>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.5}
          maxZoom={1.5}
        >
          <Background color="#1e293b" gap={12} size={1.2} />
          <Controls className="bg-slate-900 border border-slate-800 text-slate-200 fill-slate-200 rounded" />
          
          <Panel position="bottom-center" className="bg-slate-950/85 border border-slate-800 rounded-xl px-4 py-2.5 text-[10px] font-mono text-slate-400 flex items-center space-x-6 backdrop-blur">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Operational</span>
            </div>
            <div className="flex-1 h-3 border-r border-slate-800" />
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Warnings</span>
            </div>
            <div className="flex-1 h-3 border-r border-slate-800" />
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Critical Breach</span>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      {/* Right panel - Node inspector sidebar (1/4 Width) */}
      <div className="w-full lg:w-80 shrink-0 glass-panel rounded-xl p-5 border border-slate-900 bg-slate-950/60 flex flex-col overflow-y-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4 border-b border-slate-900 pb-3">Node Inspector</span>
        
        {selectedNode ? (
          <div className="space-y-6 text-left flex-1 flex flex-col">
            {/* Header info */}
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">{selectedNode.type} ID</span>
              <h3 className="text-lg font-extrabold text-slate-200 mt-1">{selectedNode.id}</h3>
              <p className="text-xs text-slate-400 mt-2 font-mono">{selectedNode.description}</p>
            </div>

            {/* Warn status indicator */}
            {["SOP-12 Compressor Operations", "Compliance Rule", "Inspection Schedule"].includes(selectedNode.id) ? (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/15 text-xs text-red-400 flex items-start space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Active Blast Warning</p>
                  <p className="leading-relaxed">This node falls directly in the blast radius of critical changes made in SOP-12 Compressor Operations. Checklist removal violates OSHA safety compliance rules.</p>
                </div>
              </div>
            ) : selectedNode.status === "Maintenance Required" ? (
              <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/15 text-xs text-amber-400 flex items-start space-x-2">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Pending Actions</p>
                  <p className="leading-relaxed">Steam leak warning is active. Routine maintenance log update is required to clear status.</p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-xs text-emerald-400 flex items-start space-x-2">
                <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Status Normal</p>
                  <p className="leading-relaxed">Node parameters operating within safe structural thresholds. No active alerts reported.</p>
                </div>
              </div>
            )}

            {/* Flow analysis details */}
            <div className="border-t border-slate-900 pt-5 space-y-4 mt-auto">
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Industrial Hierarchy Role</span>
              <p className="text-xs text-slate-400 leading-relaxed leading-5">
                {selectedNode.type === "asset" && "Assets represent core hardware units. Changes in operational procedures map directly to these physical nodes to trace risk and downtime."}
                {selectedNode.type === "team" && "Teams represent human work units. Procedure amendments immediately shift maintenance obligations, safety checklist verification, and schedules for assigned teams."}
                {selectedNode.type === "document" && "Documents record the legal, standard operating (SOP), or audit regulations governing factory safety operations."}
                {selectedNode.type === "compliance" && "Compliance rules define the regulatory thresholds (such as OSHA or EPA standards) that must be preserved."}
                {selectedNode.type === "schedule" && "Inspection schedules govern physical intervals of asset checks, representing the final downstream execution of standard operating guidelines."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-6 font-mono text-[10px] text-slate-500">
            Click on any node in the diagram to inspect its parameters and warning logs
          </div>
        )}
      </div>
    </div>
  );
}
