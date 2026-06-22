import sys
import os

# Add parent directory to path so we can import from backend
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from .database import init_db, SessionLocal
from .models import Asset, Document, DocumentVersion, RiskAssessment, DependencyEdge

def test_database():
    print("Initializing Database...")
    init_db()
    
    db = SessionLocal()
    try:
        # Check assets
        assets_count = db.query(Asset).count()
        print(f"Total Assets Seeded: {assets_count} (Expected: 50)")
        
        # Check documents
        docs_count = db.query(Document).count()
        print(f"Total Documents Seeded: {docs_count} (Expected: 100)")
        
        # Check specific SOP-12
        sop12 = db.query(Document).filter(Document.name == "SOP-12 Compressor Operations").first()
        if sop12:
            print(f"Found SOP-12 document. ID: {sop12.id}")
            versions_count = len(sop12.versions)
            print(f"SOP-12 Versions: {versions_count} (Expected: 2)")
            
            # Check risk assessment
            ra = db.query(RiskAssessment).filter(RiskAssessment.document_id == sop12.id).first()
            if ra:
                print(f"Risk Assessment for SOP-12 exists. Level: {ra.risk_level}, Score: {ra.risk_score} (Expected Level: Critical, Score: 75+)")
            else:
                print("WARNING: SOP-12 Risk Assessment NOT found!")
        else:
            print("WARNING: SOP-12 document NOT found!")
            
        # Check dependency paths
        edges = db.query(DependencyEdge).all()
        print(f"Total Dependency Edges: {len(edges)}")
        for e in edges:
            if "Compressor-A" in e.source_id or "SOP-12" in e.source_id:
                print(f"  Edge: {e.source_id} ({e.source_type}) -> {e.target_id} ({e.target_type})")
                
        print("\nAll database checks complete!")
    except Exception as e:
        print(f"Database verification failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_database()
