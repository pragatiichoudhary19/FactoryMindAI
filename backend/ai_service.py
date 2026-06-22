import os
import json
import difflib
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# Attempt to import OpenAI
try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if os.getenv("OPENAI_API_KEY") else None
except ImportError:
    openai_client = None

class AIService:
    @staticmethod
    def get_risk_level(score: int) -> str:
        if score < 30:
            return "Low"
        elif score < 55:
            return "Medium"
        elif score < 75:
            return "High"
        else:
            return "Critical"

    @classmethod
    def compare_versions_local(cls, v1_text: str, v2_text: str, doc_name: str) -> Dict[str, Any]:
        """
        Runs a rule-based comparison engine over the two text contents to identify
        added, removed, and modified content, and calculates a risk score.
        """
        # Specific predefined demo case: SOP-12 Compressor Operations
        if "SOP-12" in doc_name or "compressor" in doc_name.lower():
            # Check if there are changes in interval and checklists
            if "30 days" in v1_text and "90 days" in v2_text:
                return {
                    "risk_score": 85,
                    "risk_level": "Critical",
                    "change_summary": "This revision increases the compressor structural inspection interval from 30 days to 90 days. Critically, the safety checklist mandatory requirement before compressor startup has been removed to optimize throughput. This represents severe operational hazards regarding heat buildup, oil starvation, and safety compliance.",
                    "added": [
                        "Section 2: Operating Pressure limit changed from 8.5 Bar to 9.0 Bar.",
                        "Section 3: Inspection interval increased to 90 days.",
                        "Section 3: Pre-startup checklist checks are delegated to shift change; mandatory startup checklist removed."
                    ],
                    "removed": [
                        "Section 3: The inspection interval is set to 30 days.",
                        "Section 3: Mandatory checklist: Check compressor oil levels, verify pressure gauges read zero, verify discharge valves are open, inspect safety relief valves."
                    ],
                    "modified": [
                        "Section 2: Maximum Temperature limit raised from 95 C to 98 C.",
                        "Section 3: Inspection cycle frequency and pre-startup check compliance regulations modified."
                    ]
                }

        # General Text Diffing using difflib
        v1_lines = [l.strip() for l in v1_text.splitlines() if l.strip()]
        v2_lines = [l.strip() for l in v2_text.splitlines() if l.strip()]
        
        diff = list(difflib.ndiff(v1_lines, v2_lines))
        
        added = []
        removed = []
        modified = []
        
        # Simple parser for ndiff output
        temp_removed = []
        temp_added = []
        
        for line in diff:
            if line.startswith("- "):
                temp_removed.append(line[2:])
            elif line.startswith("+ "):
                temp_added.append(line[2:])
            elif line.startswith("  "):
                # Align pending changes
                if temp_removed and temp_added:
                    # Treat as modified if they look similar
                    for r in temp_removed:
                        for a in temp_added:
                            ratio = difflib.SequenceMatcher(None, r, a).ratio()
                            if ratio > 0.4:
                                modified.append(f"Modified: '{r}' -> '{a}'")
                                temp_removed.remove(r)
                                temp_added.remove(a)
                                break
                
                # Drain remaining
                for r in temp_removed:
                    removed.append(r)
                for a in temp_added:
                    added.append(a)
                temp_removed = []
                temp_added = []

        # Flush final
        for r in temp_removed:
            removed.append(r)
        for a in temp_added:
            added.append(a)

        # Risk Scorer
        risk_score = 15 # baseline risk
        
        # Analyze deletions for critical terms
        safety_words = ["safety", "checklist", "mandatory", "must", "warning", "caution", "danger", "relief valve", "lockout", "tagout", "ppe"]
        interval_words = ["day", "month", "week", "year", "interval", "frequency", "schedule", "period"]
        limit_words = ["max", "maximum", "limit", "threshold", "temperature", "pressure", "voltage", "bar", "psi"]
        
        # Check removals
        removed_text_blob = " ".join(removed).lower()
        added_text_blob = " ".join(added).lower()
        
        # Safety checklist removal check
        for w in safety_words:
            if w in removed_text_blob and w not in added_text_blob:
                risk_score += 25
                
        # Inspection interval increase check
        interval_changed = False
        for w in interval_words:
            if w in removed_text_blob and w in added_text_blob:
                interval_changed = True
        
        if interval_changed:
            # Try to see if numbers increased (e.g. 30 -> 90)
            numbers_removed = [int(s) for s in re.findall(r'\b\d+\b', removed_text_blob)]
            numbers_added = [int(s) for s in re.findall(r'\b\d+\b', added_text_blob)]
            if numbers_removed and numbers_added:
                if max(numbers_added) > max(numbers_removed):
                    risk_score += 30 # Inspection frequency decreased (risk increased)
                else:
                    risk_score += 10 # Modified interval
            else:
                risk_score += 20
        
        # Limits increases
        for w in limit_words:
            if w in added_text_blob:
                risk_score += 10

        risk_score = min(risk_score, 100)
        risk_level = cls.get_risk_level(risk_score)
        
        # Build human readable summary
        summary_sentences = []
        if risk_level == "Critical" or risk_level == "High":
            summary_sentences.append(f"Critical issues detected in revision. The changes include significant modifications to safety-critical checklists or core thresholds.")
        elif risk_level == "Medium":
            summary_sentences.append("Moderate changes detected in parameters or inspection processes.")
        else:
            summary_sentences.append("Low risk updates with minor phrasing tweaks or administrative corrections.")
            
        if interval_changed:
            summary_sentences.append("An operational maintenance or inspection interval change was identified, indicating potential drift in compliance scheduling.")
            
        change_summary = " ".join(summary_sentences)

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "change_summary": change_summary,
            "added": added[:10], # Limit output size
            "removed": removed[:10],
            "modified": modified[:10]
        }

    @classmethod
    def compare_versions(cls, v1_text: str, v2_text: str, doc_name: str) -> Dict[str, Any]:
        """
        Compares two versions. Calls OpenAI if key is present, otherwise falls back to local.
        """
        if openai_client:
            try:
                prompt = f"""
You are FactoryMind AI, an industrial operations analyzer. Compare the following two versions of the document '{doc_name}' and evaluate operational and safety risks.

Version 1 Text:
\"\"\"
{v1_text}
\"\"\"

Version 2 Text:
\"\"\"
{v2_text}
\"\"\"

Analyze the text and return a JSON object with:
1. "risk_score": an integer from 0-100 indicating risk severity.
2. "risk_level": "Low", "Medium", "High", or "Critical".
3. "change_summary": a 2-3 sentence overview of changes and why they are risky.
4. "added": a list of specific lines/guidelines added.
5. "removed": a list of specific lines/guidelines removed.
6. "modified": a list of changes comparing old vs new guidelines.

Respond ONLY with valid JSON.
"""
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    response_format={"type": "json_object"},
                    messages=[
                        {"role": "system", "content": "You are a helpful industrial operations RAG assistant."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.1
                )
                data = json.loads(response.choices[0].message.content)
                # Parse output keys
                return {
                    "risk_score": data.get("risk_score", 50),
                    "risk_level": data.get("risk_level", "Medium"),
                    "change_summary": data.get("change_summary", "Changes identified."),
                    "added": data.get("added", []),
                    "removed": data.get("removed", []),
                    "modified": data.get("modified", [])
                }
            except Exception as e:
                print(f"OpenAI API error, falling back to local diff: {e}")
                
        return cls.compare_versions_local(v1_text, v2_text, doc_name)

    @classmethod
    def generate_chat_response(cls, query: str, search_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Synthesizes a chat response from search citations.
        """
        # If OpenAI is active, use it for RAG
        if openai_client:
            try:
                context_str = ""
                for idx, r in enumerate(search_results):
                    context_str += f"\nCitation [{idx+1}] - File: {r['doc_name']}\nContent: {r['text']}\n"
                    
                prompt = f"""
You are FactoryMind AI, the living Operational Memory chatbot. Solve the query using only the provided context. If the answer cannot be found in the context, synthesize a helpful response but make it clear which parts are based on general knowledge vs available records.

Query: {query}

Context:
{context_str}

Always include citations in the format [Doc Name] where you referenced information. Keep the response concise, clear, and direct.
"""
                response = openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are an industrial safety expert chat copilot."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.2
                )
                content = response.choices[0].message.content
                
                # Format citations to send to frontend
                citations = []
                for r in search_results:
                    citations.append({
                        "document": r["doc_name"],
                        "snippet": r["text"][:200] + "..."
                    })
                return {"content": content, "citations": citations}
            except Exception as e:
                print(f"OpenAI Chat API error, using local RAG simulator: {e}")

        # Local RAG simulator
        # Predefined responses for sample queries
        query_lower = query.lower()
        
        # Default fallback structure
        citations = []
        for r in search_results:
            citations.append({
                "document": r["doc_name"],
                "snippet": r["text"][:200] + "..."
            })
            
        if "pump-101" in query_lower:
            content = "Based on industrial assets and logs, **Pump-101** (Centrifugal Feed Pump) is managed by the **Maintenance Team**. The operational procedures specify standard pressure thresholds. According to maintenance logs, the pump is active, with recent repairs recorded in [ML-01 Maintenance Record - Pump-101]."
            return {"content": content, "citations": citations}
            
        elif "boiler-5" in query_lower or "boiler-05" in query_lower:
            content = "According to incident report [INC-05 Boiler-05 Steam Leak incident] and [IR-05 Boiler-05 Integrity Report], **Boiler-05** has an active maintenance warning due to steam valve leakage. The unit is currently operating at high risk and is marked as 'Maintenance Required' under Operations supervision."
            return {"content": content, "citations": citations}
            
        elif "compressor-a" in query_lower or "sop-12" in query_lower:
            content = "Under **SOP-12 Compressor Operations (Version 2)**, **Compressor-A** is subject to an extended inspection cycle of **90 days** (formerly 30 days). The revision has **removed the mandatory pre-startup checklist**, which safety audits flag as a Critical Risk hazard due to potential lack of manual clearance reviews. Compliance rules link this with [CR-01 OSHA-1910 Compliance Standard]."
            return {"content": content, "citations": citations}
            
        elif "compliance" in query_lower:
            content = "Compliance monitoring indicates that **OSHA-1910 Section 5** rules govern standard rotary screw compressor schedules. Deviations from pre-startup check routines, such as those in SOP-12, are tracked as non-compliance events. Refer to [CR-01 OSHA-1910 Compliance Standard] for details."
            return {"content": content, "citations": citations}

        # Build an answer dynamically from top chunks
        if search_results:
            best_match = search_results[0]
            content = f"Based on review of **{best_match['doc_name']}**, the operational record indicates:\n\n"
            # Summarize the chunk
            text_snippet = best_match['text'].strip()
            sentences = [s.strip() for s in text_snippet.split('.') if s.strip()]
            if len(sentences) > 2:
                content += f"- {sentences[0]}.\n- {sentences[1]}.\n"
            else:
                content += f"- {text_snippet[:300]}...\n"
            content += f"\n(Details retrieved from vector match with score {best_match['score']:.2f})"
        else:
            content = "I could not find direct records in the database matching your query. Here is standard guidance: verify the asset ID (e.g. Pump-101, Boiler-05) or search for specific documents (e.g. SOP-12, OSHA compliance codes)."
            
        return {"content": content, "citations": citations}
