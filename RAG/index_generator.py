import os
from typing import Optional

# Note: main.py is responsible for calling load_dotenv() at program start.
from llama_index.core import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    StorageContext,
    load_index_from_storage,
)

def load_index(
    persist_dir: Optional[str] = None,
    data_dir: Optional[str] = None,
    create_new: bool = False,
):
    """
    Load or create a LlamaIndex VectorStoreIndex.

    Configuration is read from environment variables if arguments are not supplied:
      - INDEX_PERSIST_DIR (default: "index_storage")
      - INDEX_DATA_DIR (default: "data")

    Returns the index instance or None on failure.
    """
    # Read from env if parameters not provided
    persist_dir = persist_dir or os.getenv("INDEX_PERSIST_DIR", "index_storage")
    data_dir = data_dir or os.getenv("INDEX_DATA_DIR", "data")

    try:
        if not create_new and os.path.exists(persist_dir):
            print(f"Loading existing index from {persist_dir}...")
            storage_context = StorageContext.from_defaults(persist_dir=persist_dir)
            index = load_index_from_storage(storage_context)
            return index
        else:
            print(f"Creating new index from data in {data_dir}...")
            if not os.path.exists(data_dir):
                raise FileNotFoundError(f"Data directory '{data_dir}' does not exist")
            documents = SimpleDirectoryReader(data_dir).load_data()
            index = VectorStoreIndex.from_documents(documents, show_progress=True, num_workers=4)
            index.storage_context.persist(persist_dir=persist_dir)
            return index
    except Exception as e:
        print(f"Error loading/creating index: {e}")
        return None