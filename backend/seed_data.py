import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Asset, Document, DocumentVersion, DependencyEdge, RiskAssessment, ChatMessage

def seed_all(db: Session):
    # 1. Seed Assets (50 Assets)
    assets = []
    
    # Predefined assets from the prompt
    assets.append(Asset(id="Pump-101", name="Centrifugal Feed Pump 101", type="Pump", department="Maintenance", criticality="Critical", status="Operational"))
    assets.append(Asset(id="Boiler-05", name="High-Pressure Steam Boiler 05", type="Boiler", department="Operations", criticality="High", status="Maintenance Required"))
    assets.append(Asset(id="Compressor-A", name="Rotary Screw Air Compressor A", type="Compressor", department="Maintenance", criticality="Critical", status="Operational"))
    assets.append(Asset(id="Heat Exchanger-07", name="Shell & Tube Heat Exchanger 07", type="Heat Exchanger", department="Operations", criticality="Medium", status="Operational"))
    assets.append(Asset(id="Cooling Tower-03", name="Induced Draft Cooling Tower 03", type="Cooling Tower", department="HSE", criticality="Low", status="Operational"))
    
    # Generate remaining 45 assets to reach 50 total
    types = ["Pump", "Boiler", "Compressor", "Heat Exchanger", "Cooling Tower"]
    departments = ["Maintenance", "Operations", "HSE", "Engineering"]
    criticalities = ["Low", "Medium", "High", "Critical"]
    statuses = ["Operational", "Maintenance Required", "Offline"]
    
    for i in range(1, 46):
        asset_id = f"{types[i % 5]}-{100 + i}"
        name = f"Industrial {types[i % 5]} Unit {100 + i}"
        dept = departments[i % 4]
        crit = criticalities[i % 4]
        status = statuses[i % 3]
        
        # Don't duplicate predefined ones
        if asset_id not in [a.id for a in assets]:
            assets.append(Asset(
                id=asset_id,
                name=name,
                type=types[i % 5],
                department=dept,
                criticality=crit,
                status=status
            ))
            
    db.add_all(assets[:50]) # Guarantee exactly 50
    db.commit()

    # 2. Seed Documents (100 Documents)
    # Categories: SOP (20), Maintenance Log (20), Inspection Report (20), Incident Report (20), Compliance Record (20)
    documents = []
    
    # SOPs (20)
    for i in range(1, 21):
        name = f"SOP-{i:02d} Compressor Operations" if i == 12 else f"SOP-{i:02d} Industrial Safety Guide"
        documents.append(Document(name=name, category="SOP", created_at=(datetime.now() - timedelta(days=180 + i)).strftime("%Y-%m-%d")))
        
    # Maintenance Logs (20)
    for i in range(1, 21):
        name = f"ML-{i:02d} Maintenance Record - Pump-101" if i == 1 else f"ML-{i:02d} Maintenance Log Book"
        documents.append(Document(name=name, category="Maintenance Log", created_at=(datetime.now() - timedelta(days=90 + i)).strftime("%Y-%m-%d")))

    # Inspection Reports (20)
    for i in range(1, 21):
        name = f"IR-{i:02d} Boiler-05 Integrity Report" if i == 5 else f"IR-{i:02d} Annual Inspection Review"
        documents.append(Document(name=name, category="Inspection Report", created_at=(datetime.now() - timedelta(days=60 + i)).strftime("%Y-%m-%d")))

    # Incident Reports (20)
    for i in range(1, 21):
        name = f"INC-{i:02d} Boiler-05 Steam Leak incident" if i == 5 else f"INC-{i:02d} Site Incident Report"
        documents.append(Document(name=name, category="Incident Report", created_at=(datetime.now() - timedelta(days=30 + i)).strftime("%Y-%m-%d")))

    # Compliance Records (20)
    for i in range(1, 21):
        name = f"CR-{i:02d} OSHA-1910 Compliance Standard" if i == 1 else f"CR-{i:02d} Environmental Emissions Record"
        documents.append(Document(name=name, category="Compliance Record", created_at=(datetime.now() - timedelta(days=120 + i)).strftime("%Y-%m-%d")))

    db.add_all(documents)
    db.commit()

    # 3. Seed Versions
    # We will seed versions for SOP-12 and others
    sop12_doc = db.query(Document).filter(Document.name == "SOP-12 Compressor Operations").first()
    
    sop12_v1_text = """FACTORYMIND INDUSTRIAL OPERATIONS MANUAL
SOP-12: ROTARY COMPRESSOR OPERATIONS AND SAFETY GUIDELINES
Document Reference: SOP-12-REV1
Approved by: Operations Director
Effective Date: 2025-01-15

1. OVERVIEW
This Standard Operating Procedure (SOP) defines the operational guidelines for Rotary Screw Air Compressor A (Compressor-A) located in Sector 4.

2. OPERATIONAL PARAMETERS
- Operating Pressure: 7.5 - 8.5 Bar
- Maximum Temperature limit: 95 C
- Vibration Tolerance: < 2.5 mm/s

3. MAINTENANCE AND INSPECTION
- The inspection interval is set to 30 days. The Maintenance Team must perform a complete structural check, lubricating bearing assemblies and reviewing oil filtration systems.
- A mandatory checklist must be executed before startup:
  1. Check compressor oil levels.
  2. Verify all pressure gauges are reading zero before startup.
  3. Verify discharge valves are open and bypass valves are closed.
  4. Inspect safety relief valves for visible blockages.

4. SAFETY COMPLIANCE
This document aligns with OSHA-1910 Section 5 compliance rule (Compliance Rule). All teams must report deviation immediately."""

    sop12_v2_text = """FACTORYMIND INDUSTRIAL OPERATIONS MANUAL
SOP-12: ROTARY COMPRESSOR OPERATIONS AND SAFETY GUIDELINES
Document Reference: SOP-12-REV2
Approved by: Maintenance Director
Effective Date: 2026-06-01

1. OVERVIEW
This Standard Operating Procedure (SOP) defines the operational guidelines for Rotary Screw Air Compressor A (Compressor-A) located in Sector 4.

2. OPERATIONAL PARAMETERS
- Operating Pressure: 7.5 - 9.0 Bar (Increased operational range tolerance)
- Maximum Temperature limit: 98 C
- Vibration Tolerance: < 2.8 mm/s

3. MAINTENANCE AND INSPECTION
- The inspection interval is set to 90 days. The Maintenance Team must perform a complete structural check, lubricating bearing assemblies and reviewing oil filtration systems.
- Pre-startup checklist checks are delegated to individual operators at shift change, and the formal mandatory checklist requirement before every single startup is removed from this manual to optimize throughput.

4. SAFETY COMPLIANCE
This document aligns with OSHA-1910 Section 5 compliance rule (Compliance Rule). All teams must report deviation immediately."""

    v1 = DocumentVersion(
        document_id=sop12_doc.id,
        version=1,
        filename="SOP_v1.pdf",
        uploaded_at="2025-01-15 08:30:00",
        content=sop12_v1_text
    )
    v2 = DocumentVersion(
        document_id=sop12_doc.id,
        version=2,
        filename="SOP_v2.pdf",
        uploaded_at="2026-06-01 10:45:00",
        content=sop12_v2_text
    )
    db.add(v1)
    db.add(v2)
    db.commit()

    # Seed some standard versions for other documents so they have at least v1
    all_docs = db.query(Document).all()
    for doc in all_docs:
        if doc.id == sop12_doc.id:
            continue
        # Default single version
        db.add(DocumentVersion(
            document_id=doc.id,
            version=1,
            filename=f"{doc.category.lower().replace(' ', '_')}_{doc.id}_v1.txt",
            uploaded_at=(datetime.now() - timedelta(days=100)).strftime("%Y-%m-%d %H:%M:%S"),
            content=f"This is the seeded content for {doc.name}. Category: {doc.category}. Operational guidelines, maintenance protocols, or log records apply to this asset database entry."
        ))
    db.commit()

    # 4. Seed Risk Assessment for SOP-12 (Predefined Critical Risk)
    risk_assessment = RiskAssessment(
        document_id=sop12_doc.id,
        version_a=1,
        version_b=2,
        risk_score=88, # 75+
        risk_level="Critical",
        change_summary="This revision increases the inspection interval from 30 days to 90 days, which dramatically increases the likelihood of unnoticed equipment degradation. Additionally, it removes the mandatory safety checklist before compressor startup, creating an immediate safety risk of startup pressure buildup or oil starvation.",
        added_content=json.dumps([
            "Section 2: Operating Pressure limit changed from 8.5 Bar to 9.0 Bar.",
            "Section 3: Inspection interval increased to 90 days.",
            "Section 3: Pre-startup checklist checks are delegated to shift change; mandatory startup checklist removed."
        ]),
        removed_content=json.dumps([
            "Section 3: The inspection interval is set to 30 days.",
            "Section 3: Mandatory checklist: Check compressor oil levels, verify pressure gauges read zero, verify discharge valves are open, inspect safety relief valves."
        ]),
        modified_content=json.dumps([
            "Section 2: Maximum Temperature limit raised from 95 C to 98 C.",
            "Section 3: Inspection cycle frequency and pre-startup check compliance regulations modified."
        ]),
        created_at=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(risk_assessment)
    db.commit()

    # 5. Seed Dependency Edges
    # The specific Blast Radius Path:
    # Compressor-A -> Maintenance Team -> SOP-12 -> Compliance Rule -> Inspection Schedule
    edges = [
        DependencyEdge(source_id="Compressor-A", source_type="asset", target_id="Maintenance Team", target_type="team"),
        DependencyEdge(source_id="Maintenance Team", source_type="team", target_id="SOP-12 Compressor Operations", target_type="document"),
        DependencyEdge(source_id="SOP-12 Compressor Operations", source_type="document", target_id="Compliance Rule", target_type="compliance"),
        DependencyEdge(source_id="Compliance Rule", source_type="compliance", target_id="Inspection Schedule", target_type="schedule"),
    ]
    
    # Add other random linkages to make the graph and system feel realistic for other items
    # Link Boiler-05 to Operations Team
    edges.append(DependencyEdge(source_id="Boiler-05", source_type="asset", target_id="Operations Team", target_type="team"))
    edges.append(DependencyEdge(source_id="Operations Team", source_type="team", target_id="Boiler SOP-05", target_type="document"))
    edges.append(DependencyEdge(source_id="Boiler SOP-05", source_type="document", target_id="EPA Emissions Guidelines", target_type="compliance"))
    edges.append(DependencyEdge(source_id="EPA Emissions Guidelines", source_type="compliance", target_id="Emission Log Schedule", target_type="schedule"))
    
    # Link Pump-101 to Maintenance Team
    edges.append(DependencyEdge(source_id="Pump-101", source_type="asset", target_id="Maintenance Team", target_type="team"))
    edges.append(DependencyEdge(source_id="Maintenance Team", source_type="team", target_id="Pump SOP-01", target_type="document"))
    
    db.add_all(edges)
    db.commit()

    # Seed initial messages for chatbot demonstration
    chat_demo = [
        ChatMessage(sender="user", content="What is the maintenance procedure for Compressor-A?", timestamp=(datetime.now() - timedelta(minutes=5)).strftime("%Y-%m-%d %H:%M:%S")),
        ChatMessage(sender="assistant", content="According to SOP-12 Compressor Operations (Version 2), the maintenance procedure for Compressor-A includes a complete structural check, lubricating bearing assemblies, and reviewing oil filtration systems. Note that the inspection interval was recently increased from 30 days to 90 days, and the mandatory pre-startup safety checklist has been removed.", timestamp=(datetime.now() - timedelta(minutes=4)).strftime("%Y-%m-%d %H:%M:%S"), citations=json.dumps([{"document": "SOP-12 Compressor Operations", "snippet": "The inspection interval is set to 90 days. The Maintenance Team must perform a complete structural check, lubricating bearing assemblies..."}]))
    ]
    db.add_all(chat_demo)
    db.commit()
