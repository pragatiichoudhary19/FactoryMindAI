from sqlalchemy import Column, Integer, String, Text, ForeignKey, create_engine
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Asset(Base):
    __tablename__ = 'assets'
    id = Column(String(50), primary_key=True) # e.g. "Pump-101", "Compressor-A"
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False) # "Pump", "Boiler", "Compressor", "Heat Exchanger", "Cooling Tower"
    department = Column(String(50), nullable=False) # "Maintenance", "Operations", "HSE", "Engineering"
    criticality = Column(String(50), nullable=False) # "Low", "Medium", "High", "Critical"
    status = Column(String(50), default="Operational") # "Operational", "Maintenance Required", "Offline"

class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False, unique=True) # e.g., "SOP-12 Compressor Operations"
    category = Column(String(50), nullable=False) # "SOP", "Maintenance Log", "Inspection Report", "Incident Report", "Compliance Record"
    created_at = Column(String(50), nullable=False)
    
    versions = relationship("DocumentVersion", back_populates="document", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="document", cascade="all, delete-orphan")

class DocumentVersion(Base):
    __tablename__ = 'document_versions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey('documents.id', ondelete="CASCADE"), nullable=False)
    version = Column(Integer, nullable=False) # 1, 2, 3, etc.
    filename = Column(String(200), nullable=False)
    uploaded_at = Column(String(50), nullable=False)
    content = Column(Text, nullable=False) # Extracted text content

    document = relationship("Document", back_populates="versions")

class DependencyEdge(Base):
    __tablename__ = 'dependency_edges'
    id = Column(Integer, primary_key=True, autoincrement=True)
    source_id = Column(String(100), nullable=False)   # e.g., "Compressor-A" (asset), "Maintenance Team" (department)
    source_type = Column(String(50), nullable=False) # "asset", "team", "document", "compliance", "schedule"
    target_id = Column(String(100), nullable=False)
    target_type = Column(String(50), nullable=False)

class RiskAssessment(Base):
    __tablename__ = 'risk_assessments'
    id = Column(Integer, primary_key=True, autoincrement=True)
    document_id = Column(Integer, ForeignKey('documents.id', ondelete="CASCADE"), nullable=False)
    version_a = Column(Integer, nullable=False)
    version_b = Column(Integer, nullable=False)
    risk_score = Column(Integer, nullable=False) # 0-100
    risk_level = Column(String(20), nullable=False) # "Low", "Medium", "High", "Critical"
    change_summary = Column(Text, nullable=False)
    added_content = Column(Text, nullable=False) # JSON-serialized list of strings or lines
    removed_content = Column(Text, nullable=False) # JSON-serialized list of strings or lines
    modified_content = Column(Text, nullable=False) # JSON-serialized list of strings or lines
    created_at = Column(String(50), nullable=False)

    document = relationship("Document", back_populates="risk_assessments")

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    id = Column(Integer, primary_key=True, autoincrement=True)
    sender = Column(String(20), nullable=False) # "user", "assistant"
    content = Column(Text, nullable=False)
    timestamp = Column(String(50), nullable=False)
    citations = Column(Text, nullable=True) # JSON-serialized list of {document: str, snippet: str}
