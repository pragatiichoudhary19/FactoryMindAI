import re
import math
import numpy as np
from typing import List, Dict, Any

class SimpleVectorStore:
    def __init__(self):
        self.chunks = [] # List of dict: {doc_id: int, doc_name: str, text: str, vector: np.ndarray}
        self.vocab = {}
        self.idf = {}
        self.chunk_size = 600
        self.chunk_overlap = 150

    def clean_text(self, text: str) -> List[str]:
        # Lowers, removes special characters, and splits by word
        words = re.findall(r'\b[a-z0-9-]{3,15}\b', text.lower())
        # Filter stop words
        stop_words = {"the", "and", "for", "that", "this", "with", "from", "are", "was", "were", "been", "has", "have", "had", "not", "but", "org", "net", "com", "http", "the", "you", "your"}
        return [w for w in words if w not in stop_words]

    def chunk_text(self, text: str) -> List[str]:
        chunks = []
        words = text.split()
        if not words:
            return []
        
        i = 0
        while i < len(words):
            chunk_words = words[i:i + 100] # ~100 words per chunk
            chunks.append(" ".join(chunk_words))
            i += 70 # Overlap of 30 words
            
        return chunks

    def rebuild_index(self, db_versions: List[Any]):
        """
        Rebuilds the index from all versions in the DB.
        db_versions is a list of objects with attributes: document_id, document.name, content
        """
        self.chunks = []
        raw_chunks = [] # elements: (doc_id, doc_name, chunk_text)
        
        # 1. Extract chunks
        for ver in db_versions:
            text = ver.content
            doc_id = ver.document_id
            doc_name = ver.document.name if ver.document else f"Doc {doc_id}"
            
            text_chunks = self.chunk_text(text)
            for ch in text_chunks:
                raw_chunks.append((doc_id, doc_name, ch))
                
        if not raw_chunks:
            return

        # 2. Build Vocabulary
        self.vocab = {}
        all_cleaned_chunks = []
        for doc_id, doc_name, ch_text in raw_chunks:
            cleaned = self.clean_text(ch_text)
            all_cleaned_chunks.append(cleaned)
            for word in cleaned:
                if word not in self.vocab:
                    self.vocab[word] = len(self.vocab)
                    
        num_vocab = len(self.vocab)
        if num_vocab == 0:
            return

        # 3. Calculate IDF
        num_chunks = len(raw_chunks)
        df = {word: 0 for word in self.vocab}
        for cleaned in all_cleaned_chunks:
            unique_words = set(cleaned)
            for word in unique_words:
                df[word] += 1
                
        self.idf = {}
        for word, count in df.items():
            self.idf[word] = math.log((1 + num_chunks) / (1 + count)) + 1

        # 4. Calculate Vector for each chunk
        for idx, (doc_id, doc_name, ch_text) in enumerate(raw_chunks):
            cleaned = all_cleaned_chunks[idx]
            vector = np.zeros(num_vocab)
            
            # Count terms
            tf = {}
            for word in cleaned:
                tf[word] = tf.get(word, 0) + 1
                
            # Compute TF-IDF
            for word, count in tf.items():
                if word in self.vocab:
                    word_idx = self.vocab[word]
                    # Log-linear TF weighting
                    tf_val = 1 + math.log(count)
                    vector[word_idx] = tf_val * self.idf[word]
                    
            # Normalize vector (L2 norm)
            norm = np.linalg.norm(vector)
            if norm > 0:
                vector = vector / norm
                
            self.chunks.append({
                "doc_id": doc_id,
                "doc_name": doc_name,
                "text": ch_text,
                "vector": vector
            })

    def search(self, query: str, top_n: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks or not self.vocab:
            return []
            
        cleaned_query = self.clean_text(query)
        if not cleaned_query:
            # Fallback to random return
            return [{"doc_id": c["doc_id"], "doc_name": c["doc_name"], "text": c["text"][:300] + "...", "score": 0.1} for c in self.chunks[:top_n]]

        num_vocab = len(self.vocab)
        query_vector = np.zeros(num_vocab)
        
        # Compute TF for query
        tf = {}
        for word in cleaned_query:
            tf[word] = tf.get(word, 0) + 1
            
        for word, count in tf.items():
            if word in self.vocab:
                word_idx = self.vocab[word]
                tf_val = 1 + math.log(count)
                query_vector[word_idx] = tf_val * self.idf[word]
                
        # Normalize query vector
        q_norm = np.linalg.norm(query_vector)
        if q_norm > 0:
            query_vector = query_vector / q_norm
        else:
            return []

        # Calculate cosine similarity with all chunks
        results = []
        for ch in self.chunks:
            sim = float(np.dot(ch["vector"], query_vector))
            if sim > 0:
                results.append({
                    "doc_id": ch["doc_id"],
                    "doc_name": ch["doc_name"],
                    "text": ch["text"],
                    "score": sim
                })
                
        # Sort and return top N
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_n]

# Global store instance
vector_store = SimpleVectorStore()
