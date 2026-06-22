from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

DATABASE_URL = "sqlite:///./factory_mind.db"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    Base.metadata.create_all(bind=engine)
    
    # Import locally to avoid circular dependencies
    from .models import Asset
    from .seed_data import seed_all
    
    db = SessionLocal()
    try:
        # Check if assets table has data
        if db.query(Asset).first() is None:
            print("Database is empty. Seeding demo data...")
            seed_all(db)
            print("Database seeding completed.")
        else:
            print("Database already contains data. Skipping seeding.")
    except Exception as e:
        print(f"Error checking/seeding database: {e}")
    finally:
        db.close()
