from dotenv import load_dotenv
import os

# Load environment variables early so imported modules can read them during import
load_dotenv()

# --- Start of Gemini Configuration ---
from llama_index.core import Settings
from llama_index.llms.google_genai import GoogleGenAI
from llama_index.embeddings.gemini import GeminiEmbedding

# Check for Google API Key and configure llama-index
google_api_key = os.getenv("GOOGLE_API_KEY")
if not google_api_key:
    raise ValueError(
        "GOOGLE_API_KEY not found. Please set it in your .env file."
    )

# Configure the global settings for llama-index to use Gemini
# This will be used by default in all subsequent calls
Settings.llm = GoogleGenAI(model_name="models/gemini-pro")
Settings.embed_model = GeminiEmbedding(api_key=google_api_key, model_name="models/embedding-001")
# --- End of Gemini Configuration ---


from index_generator import load_index
from llama_index.core.memory import ChatMemoryBuffer
from llama_index.core.storage.chat_store import SimpleChatStore


if __name__ == "__main__":
    # simple smoke: try loading the index using env-configured defaults
    index = load_index()
    print("Index loaded." if index is not None else "No index returned.")
    system_prompt = (
        "You are an exper tutor for a philosophy of AI course."
        "Your role is to answer and clarify questions related to the course readings."
        "You should answer in a concise and clear manner, providing examples and analogies as often as possible."
        "If the answer is not in the readings, say you don't know."
    )

    chat_store = SimpleChatStore()
    memory = ChatMemoryBuffer.from_defaults(token_limit=3900, chat_store=chat_store, chat_store_key="default")

    chat_engine = index.as_chat_engine(
        chat_mode="context",
        memory=memory,
        system_prompt=system_prompt,
    )

    while True:
        user_input = input("User ('exit' to exit): ")
        if user_input.strip().lower() in {"exit", "quit"}:
            print("Exiting chat.")
            break
        response = chat_engine.chat(user_input)
        print(f"Bot: {response.response}")