import chromadb
from pathlib import Path

# Initialize Chroma client (stores data locally)
def init_chroma():
    """Initialize Chroma client with persistent storage"""
    chroma_dir = Path("chroma_data")
    chroma_dir.mkdir(exist_ok=True)
    
    client = chromadb.PersistentClient(path=str(chroma_dir))
    return client

# Create a collection (like a table in a database)
def create_collection(client, name="course_content"):
    """Create or get a Chroma collection"""
    # Just get or create - don't delete!
    collection = client.get_or_create_collection(
        name=name,
        metadata={"hnsw:space": "cosine"}
    )
    return collection

# Add documents to Chroma
def add_to_chroma(collection, documents, ids, metadatas=None):
    """
    Add documents to Chroma collection
    
    Args:
        collection: Chroma collection object
        documents: List of text strings
        ids: List of unique IDs for each document
        metadatas: Optional list of metadata dicts
    """
    collection.add(
        documents=documents,
        ids=ids,
        metadatas=metadatas or [{"source": "unknown"} for _ in documents]
    )
    print(f"Added {len(documents)} documents to Chroma")

# Query Chroma
def query_chroma(collection, query_text, n_results=3):
    """
    Query Chroma collection
    
    Args:
        collection: Chroma collection object
        query_text: Question or search text
        n_results: Number of results to return
    
    Returns:
        List of relevant documents
    """
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    return results

if __name__ == "__main__":
    # Test Chroma setup
    print("Testing Chroma setup...")
    
    client = init_chroma()
    print("✓ Chroma client created")
    
    collection = create_collection(client, "test_collection")
    print("✓ Collection created")
    
    # Add test documents
    test_docs = [
        "Photosynthesis is the process by which plants convert light into chemical energy.",
        "Cellular respiration is how cells break down glucose for energy.",
        "The mitochondria is the powerhouse of the cell."
    ]
    test_ids = ["doc1", "doc2", "doc3"]
    
    add_to_chroma(collection, test_docs, test_ids)
    print("✓ Test documents added")
    
    # Test query
    query = "How do plants get energy?"
    results = query_chroma(collection, query, n_results=2)
    print(f"\nQuery: '{query}'")
    print(f"Results: {results['documents']}")
    
    print("\n✅ Chroma setup successful!")