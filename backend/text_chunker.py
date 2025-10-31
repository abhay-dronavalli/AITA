def chunk_text(text, chunk_size=500, overlap=50):
    """
    Split text into overlapping chunks
    
    Args:
        text: Full text to chunk
        chunk_size: Characters per chunk (default 500)
        overlap: Overlapping characters between chunks (default 50)
    
    Returns:
        List of text chunks (just the text strings)
    """
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap
    
    return chunks


if __name__ == "__main__":
    # Test it
    sample_text = """
    Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide 
    to create oxygen and energy. This occurs in chloroplasts which contain chlorophyll.
    """ * 10  # Repeat to make longer
    
    chunks = chunk_text(sample_text, chunk_size=500, overlap=50)
    print(f"Created {len(chunks)} chunks")
    print(f"First chunk: {chunks[0][:100]}...")
    print(f"Last chunk: {chunks[-1][:100]}...")