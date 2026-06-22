"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Send, 
  Upload, 
  FileText, 
  Cpu, 
  Search, 
  AlertCircle,
  Paperclip,
  CheckCircle,
  FileIcon,
  ChevronRight,
  BookOpen
} from "lucide-react";

interface DocumentItem {
  id: number;
  name: string;
  category: string;
  created_at: string;
  versions: number[];
}

interface Citation {
  document: string;
  snippet: string;
}

interface Message {
  id: string | number;
  sender: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Citation[];
}

function CopilotContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || searchParams.get("query") || "";

  // UI state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [searchDocTerm, setSearchDocTerm] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [expandedCitation, setExpandedCitation] = useState<string | null>(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState<string>("");
  const [uploadCategory, setUploadCategory] = useState<string>("SOP");
  const [uploadVersion, setUploadVersion] = useState<number>(1);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch documents and chat history
  const fetchDocuments = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/documents");
      if (res.ok) {
        const json = await res.json();
        setDocuments(json);
      }
    } catch (e) {
      // Fallback list to keep the UI beautiful
      const fallbackDocs: DocumentItem[] = [];
      const categories = ["SOP", "Maintenance Log", "Inspection Report", "Incident Report", "Compliance Record"];
      
      fallbackDocs.push({
        id: 12,
        name: "SOP-12 Compressor Operations",
        category: "SOP",
        created_at: "2025-01-15",
        versions: [1, 2]
      });

      for (let i = 1; i <= 100; i++) {
        if (i === 12) continue;
        const cat = categories[i % 5];
        fallbackDocs.push({
          id: i,
          name: i === 1 && cat === "Maintenance Log" ? "ML-01 Maintenance Record - Pump-101" : `Industrial Document Record #${i}`,
          category: cat,
          created_at: "2026-01-20",
          versions: [1]
        });
      }
      setDocuments(fallbackDocs);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/chat/history");
      if (res.ok) {
        const json = await res.json();
        setMessages(json);
      }
    } catch (e) {
      setMessages([
        {
          id: "m1",
          sender: "user",
          content: "What is the maintenance procedure for Compressor-A?",
          timestamp: "2026-06-22 15:40:00"
        },
        {
          id: "m2",
          sender: "assistant",
          content: "According to SOP-12 Compressor Operations (Version 2), the maintenance procedure for Compressor-A includes a complete structural check, lubricating bearing assemblies, and reviewing oil filtration systems. Note that the inspection interval was recently increased from 30 days to 90 days, and the mandatory pre-startup safety checklist has been removed.",
          timestamp: "2026-06-22 15:41:00",
          citations: [
            {
              document: "SOP-12 Compressor Operations",
              snippet: "The inspection interval is set to 90 days. The Maintenance Team must perform a complete structural check, lubricating bearing assemblies and reviewing oil filtration systems."
            }
          ]
        }
      ]);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchChatHistory();
  }, []);

  // Handle dashboard redirect query
  useEffect(() => {
    if (initialQuery && messages.length > 0) {
      setInputMessage(initialQuery);
    }
  }, [initialQuery]);

  // Scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Trigger chat query
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userMsgText = inputMessage.trim();
    setInputMessage("");
    setChatLoading(true);

    const userMessage: Message = {
      id: Date.now() + "-user",
      sender: "user",
      content: userMsgText,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch("http://localhost:8000/api/documents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsgText })
      });

      if (res.ok) {
        const json = await res.json();
        const assistantMessage: Message = {
          id: Date.now() + "-assistant",
          sender: "assistant",
          content: json.content,
          timestamp: new Date().toLocaleTimeString(),
          citations: json.citations
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error();
      }
    } catch (e) {
      // Simulate answer fallback locally if API is offline
      setTimeout(() => {
        let simulatedContent = "I am operating in simulator mode. Here is the local guidance based on our seeded intelligence:\n\n";
        let citations: Citation[] = [];

        if (userMsgText.toLowerCase().includes("pump-101")) {
          simulatedContent += "Pump-101 is a Centrifugal Feed Pump operated by the Maintenance Team. Recent maintenance log ML-01 shows standard bearing grease service completed on 2026-03-12.";
          citations = [{ document: "ML-01 Maintenance Record - Pump-101", snippet: "Lubricated bearings and tested operational vibration tolerences. Pump-101 active." }];
        } else if (userMsgText.toLowerCase().includes("boiler-5") || userMsgText.toLowerCase().includes("boiler-05")) {
          simulatedContent += "Boiler-05 (High-Pressure Steam Boiler 05) is currently marked with status 'Maintenance Required' following a steam leak reported in incident report INC-05. Standard startup procedures require checking structural integrity limits.";
          citations = [{ document: "INC-05 Boiler-05 Steam Leak incident", snippet: "Main steam vent valve seal degraded. Unit pressure fluctuating. Operations team recommended seal overhaul." }];
        } else if (userMsgText.toLowerCase().includes("compressor-a") || userMsgText.toLowerCase().includes("sop-12")) {
          simulatedContent += "Under SOP-12 Compressor Operations (Version 2), Compressor-A is subjected to a 90-day inspection schedule. The mandatory startup checklist has been removed from operations guidelines, causing high risk flags in audit logs.";
          citations = [{ document: "SOP-12 Compressor Operations", snippet: "The inspection interval is set to 90 days... pre-startup checklist checks are delegated to shift change; mandatory checklist removed." }];
        } else {
          simulatedContent += "To provide accurate guidance, I matched query keywords in the offline corpus. Standard procedure recommends reviewing compliance and SOP logs relative to specific asset IDs (e.g. Pump-101, Compressor-A).";
          citations = [{ document: "CR-01 OSHA-1910 Compliance Standard", snippet: "All standard operational instructions (SOP) must be audited and verified quarterly by engineering boards." }];
        }

        const assistantMessage: Message = {
          id: Date.now() + "-simulated",
          sender: "assistant",
          content: simulatedContent,
          timestamp: new Date().toLocaleTimeString(),
          citations
        };
        setMessages(prev => [...prev, assistantMessage]);
      }, 800);
    } finally {
      setChatLoading(false);
    }
  };

  // Handle document upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadName.trim()) {
      setUploadMessage({ type: "error", text: "Please specify document name and choose a file." });
      return;
    }

    setUploadLoading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("doc_name", uploadName);
    formData.append("category", uploadCategory);
    formData.append("version", String(uploadVersion));

    try {
      const res = await fetch("http://localhost:8000/api/documents/upload", {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        setUploadMessage({ type: "success", text: `Successfully uploaded ${uploadName} v${uploadVersion}` });
        setUploadFile(null);
        setUploadName("");
        setUploadVersion(1);
        fetchDocuments();
      } else {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }
    } catch (e: any) {
      setUploadMessage({ type: "error", text: e.message || "Failed to connect to API server for upload. Start backend first." });
    } finally {
      setUploadLoading(false);
    }
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    const matchCat = filterCategory === "All" || doc.category === filterCategory;
    const matchTerm = doc.name.toLowerCase().includes(searchDocTerm.toLowerCase()) || 
                      doc.category.toLowerCase().includes(searchDocTerm.toLowerCase());
    return matchCat && matchTerm;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-140px)] overflow-hidden">
      {/* Left Panel - Document Manager (1/4 Width) */}
      <div className="lg:col-span-1 flex flex-col h-full overflow-hidden space-y-4">
        {/* Upload Widget */}
        <div className="glass-panel rounded-xl p-4 flex flex-col border border-slate-900 bg-slate-950/60 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Upload SOP / Record</span>
          
          <form onSubmit={handleUploadSubmit} className="space-y-3">
            <div>
              <input 
                type="text" 
                placeholder="Document Name (e.g. SOP-15)"
                value={uploadName}
                onChange={(e) => setUploadName(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-slate-200 focus:outline-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <select 
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-slate-200 focus:outline-none"
              >
                <option value="SOP">SOP</option>
                <option value="Maintenance Log">Maint Log</option>
                <option value="Inspection Report">Inspection</option>
                <option value="Incident Report">Incident</option>
                <option value="Compliance Record">Compliance</option>
              </select>
              <input 
                type="number" 
                min="1"
                placeholder="Ver #"
                value={uploadVersion}
                onChange={(e) => setUploadVersion(parseInt(e.target.value) || 1)}
                className="text-xs bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded p-2 text-slate-200 focus:outline-none w-full"
              />
            </div>

            {/* Custom file selector input */}
            <div className="relative border border-dashed border-slate-800 rounded p-3 text-center bg-slate-950/60 hover:bg-slate-900/60 transition-colors">
              <input 
                type="file" 
                accept=".pdf,.docx,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <Paperclip className="h-4 w-4 text-slate-500" />
                <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                  {uploadFile ? uploadFile.name : "Choose PDF, DOCX, TXT"}
                </span>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={uploadLoading}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 text-xs font-bold rounded flex items-center justify-center space-x-1 transition-colors"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{uploadLoading ? "Uploading..." : "Index Document"}</span>
            </button>
          </form>

          {uploadMessage && (
            <div className={`mt-2 p-2 rounded text-[10px] flex items-start space-x-1 ${
              uploadMessage.type === "success" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/25" : "bg-red-950/40 text-red-400 border border-red-500/25"
            }`}>
              <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{uploadMessage.text}</span>
            </div>
          )}
        </div>

        {/* Catalog List */}
        <div className="glass-panel rounded-xl p-4 flex-1 flex flex-col border border-slate-900 bg-slate-950/60 overflow-hidden">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Knowledge Catalog ({filteredDocs.length})</span>
          
          <div className="relative mb-3 shrink-0">
            <Search className="h-3 w-3 absolute left-2.5 top-2.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search repository..."
              value={searchDocTerm}
              onChange={(e) => setSearchDocTerm(e.target.value)}
              className="w-full text-[10px] bg-slate-900 border border-slate-800 rounded pl-7 pr-2 py-2 text-slate-200 focus:outline-none"
            />
          </div>

          <div className="flex space-x-1 mb-3 shrink-0 overflow-x-auto pb-1 text-[9px] font-mono">
            {["All", "SOP", "Maintenance Log", "Inspection Report", "Incident Report", "Compliance Record"].map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded border shrink-0 ${
                  filterCategory === cat ? "bg-emerald-950 text-emerald-400 border-emerald-500/20" : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
                }`}
              >
                {cat === "Maintenance Log" ? "Logs" : cat === "Inspection Report" ? "Inspections" : cat === "Incident Report" ? "Incidents" : cat === "Compliance Record" ? "Compliance" : cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredDocs.map(doc => (
              <div 
                key={doc.id}
                className="p-2.5 rounded border border-slate-900 bg-slate-950/40 hover:border-slate-800 hover:bg-slate-900/10 transition-all text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="overflow-hidden">
                    <span className="text-[9px] font-mono text-slate-500 font-bold block uppercase">{doc.category}</span>
                    <h5 className="text-[11px] font-bold text-slate-300 truncate mt-0.5">{doc.name}</h5>
                  </div>
                  <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1 py-0.5 rounded shrink-0">
                    V{doc.versions.join(', ')}
                  </span>
                </div>
              </div>
            ))}
            {filteredDocs.length === 0 && (
              <p className="text-[10px] text-slate-500 text-center py-6 font-mono">No documents found matching filters</p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - RAG Copilot Chat (3/4 Width) */}
      <div className="lg:col-span-3 glass-panel rounded-xl flex flex-col h-full overflow-hidden border border-slate-900 bg-slate-950/40">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Operations Intelligence Assistant</span>
          </div>
          <span className="text-[9px] font-mono text-slate-500">RAG Context Engine Active</span>
        </div>

        {/* Conversation Box */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div 
              key={msg.id || index}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <span className="text-[9px] font-mono text-slate-500 mb-1 select-none">
                {msg.sender === "user" ? "You" : "FactoryMind AI"} • {msg.timestamp}
              </span>
              
              <div 
                className={`p-3.5 rounded-xl border text-sm leading-relaxed ${
                  msg.sender === "user" 
                    ? "bg-slate-900/60 border-slate-800 text-slate-200 rounded-tr-none" 
                    : "bg-emerald-950/10 border-emerald-500/10 text-slate-300 rounded-tl-none"
                }`}
              >
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? "mt-2" : ""}>
                    {line}
                  </p>
                ))}

                {/* Citations Card display */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-900/80">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase mb-1">Source Citations:</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.citations.map((cit, c_idx) => {
                        const citKey = `${index}-${c_idx}`;
                        const isExpanded = expandedCitation === citKey;
                        return (
                          <div key={c_idx} className="flex flex-col max-w-full">
                            <button
                              onClick={() => setExpandedCitation(isExpanded ? null : citKey)}
                              className="text-[9px] font-mono px-2 py-1 bg-slate-900 border border-slate-800 text-emerald-400 rounded-md hover:border-emerald-500/20 hover:bg-slate-950 transition-all flex items-center space-x-1 shrink-0"
                            >
                              <FileText className="h-3 w-3 text-emerald-400" />
                              <span className="truncate">{cit.document}</span>
                              <ChevronRight className={`h-3 w-3 transform transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                            </button>
                            {isExpanded && (
                              <div className="mt-1 p-2 bg-slate-950 border border-slate-900 text-[10px] text-slate-400 rounded font-mono max-w-md leading-relaxed whitespace-pre-wrap">
                                {cit.snippet}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex flex-col max-w-[80%] mr-auto items-start">
              <span className="text-[9px] font-mono text-slate-500 mb-1 animate-pulse">FactoryMind AI is processing...</span>
              <div className="p-3 bg-emerald-950/5 border border-emerald-500/5 text-slate-400 rounded-xl rounded-tl-none flex items-center space-x-2 text-xs">
                <div className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Scanning 100 industrial docs...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-900 bg-slate-950/60 flex items-center space-x-3 shrink-0">
          <input 
            type="text"
            placeholder="Ask AI Copilot (e.g. 'What is the startup sequence in SOP-12?')"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={chatLoading}
            className="flex-1 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <button 
            type="submit"
            disabled={!inputMessage.trim() || chatLoading}
            className="p-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-700 text-slate-950 font-bold rounded-xl transition-all shadow-md shadow-emerald-500/5 hover:shadow-emerald-500/20"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AIAppCopilot() {
  return (
    <Suspense fallback={<div>Loading copilot engine...</div>}>
      <CopilotContent />
    </Suspense>
  );
}
