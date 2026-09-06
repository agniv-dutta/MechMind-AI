from pydantic_settings import BaseSettings
from pydantic import Field, validator
from typing import List
import os


class Settings(BaseSettings):
    """Application configuration settings"""
    
    # API Configuration
    API_ENV: str = Field(default="development", description="Environment (development/production)")
    API_KEY: str = Field(default="", description="Secret API key for authentication")
    ALLOWED_ORIGINS: str = Field(
        default="http://localhost:3000,http://localhost:5173,http://0.0.0.0:3000",
        description="CORS allowed origins"
    )
    # Public origin (no scheme) used to detect request origin for CORS
    ALLOWED_ORIGINS_RAW: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Raw allowed origins (no trailing slash)"
    )
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./industrial_troubleshooting.db",
        description="Database connection URL"
    )
    
    # Vector Store Configuration
    VECTOR_DB_TYPE: str = Field(default="faiss", description="Vector database type (faiss/qdrant/chroma)")
    VECTOR_DB_PATH: str = Field(default="./data/vector_store", description="Path to vector store")
    EMBEDDING_MODEL: str = Field(default="all-MiniLM-L6-v2", description="Embedding model name")
    EMBEDDING_DIMENSION: int = Field(default=384, description="Embedding vector dimension")
    
    # LLM Configuration - Using Groq API
    LLM_PROVIDER: str = Field(default="groq", description="LLM provider (groq/openai/ollama)")
    GROQ_API_KEY: str = Field(default="", description="Groq API key")
    GROQ_MODEL: str = Field(default="openai/gpt-oss-120b", description="Groq model name")
    GROQ_MODELS: str = Field(
        default="openai/gpt-oss-120b,openai/gpt-oss-20b,qwen/qwen3.6-27b,qwen/qwen3.8-27b,llama-3.3-70b-versatile",
        description="Comma-separated list of available Groq models"
    )
    
    # Alternative LLM providers (kept for compatibility)
    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    OPENAI_MODEL: str = Field(default="gpt-4", description="OpenAI model name")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Ollama base URL")
    OLLAMA_MODEL: str = Field(default="mistral", description="Ollama model name")
    
    # File Upload Configuration
    UPLOAD_DIRECTORY: str = Field(default="./uploads", description="Upload directory path")
    MAX_FILE_SIZE_MB: int = Field(default=100, description="Maximum file size in MB")
    
    # Logging Configuration
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    LOG_FILE: str = Field(default="./logs/app.log", description="Log file path")
    
    # Neo4j Knowledge Graph Configuration
    NEO4J_URI: str = Field(default="bolt://localhost:7687", description="Neo4j connection URI")
    NEO4J_USERNAME: str = Field(default="neo4j", description="Neo4j username")
    NEO4J_PASSWORD: str = Field(default="password", description="Neo4j password")
    USE_NEO4J: bool = Field(default=False, description="Whether to use Neo4j or in-memory graph")
    
    # Search Configuration
    MIN_CONFIDENCE_SCORE: float = Field(default=0.3, description="Minimum confidence score for search results")
    MAX_SEARCH_RESULTS: int = Field(default=10, description="Maximum number of search results")
    HYBRID_SEARCH_SEMANTIC_WEIGHT: float = Field(default=0.7, description="Weight for semantic search in hybrid mode")
    HYBRID_SEARCH_KEYWORD_WEIGHT: float = Field(default=0.3, description="Weight for keyword search in hybrid mode")
    
    # Chunking Configuration
    CHUNK_SIZE: int = Field(default=1024, description="Maximum chunk size in tokens")
    CHUNK_OVERLAP: int = Field(default=256, description="Chunk overlap in tokens")
    MIN_CHUNK_SIZE: int = Field(default=256, description="Minimum chunk size in tokens")

    # Persistence Configuration
    SEARCH_CONFIG_PATH: str = Field(default="./data/search_config.json", description="Path to search config overrides")
    KNOWLEDGE_GRAPH_PATH: str = Field(default="./data/knowledge_graph.pkl", description="Path to persisted knowledge graph")
    PAGE_CONTENT_PATH: str = Field(default="./data/pages", description="Directory storing extracted per-page content")

    @property
    def groq_models_list(self) -> List[str]:
        """Available Groq models as a list"""
        return [m.strip() for m in self.GROQ_MODELS.split(",") if m.strip()]

    def resolve_upload_dir(self) -> str:
        """Resolve UPLOAD_DIRECTORY to an absolute path relative to the backend root"""
        p = os.path.abspath(self.UPLOAD_DIRECTORY)
        os.makedirs(p, exist_ok=True)
        return p

    def resolve_data_dir(self, subpath: str) -> str:
        """Resolve a data sub-path relative to the backend root, creating parents"""
        p = os.path.abspath(subpath)
        os.makedirs(p if subpath.endswith(os.sep) or os.path.splitext(p)[1] == "" else os.path.dirname(p), exist_ok=True)
        return p
    
    @validator('ALLOWED_ORIGINS')
    def parse_allowed_origins(cls, v):
        """Parse allowed origins string into list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @validator('LOG_LEVEL')
    def validate_log_level(cls, v):
        """Validate log level"""
        valid_levels = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']
        if v.upper() not in valid_levels:
            raise ValueError(f"LOG_LEVEL must be one of {valid_levels}")
        return v.upper()
    
    @validator('GROQ_API_KEY')
    def validate_groq_key(cls, v, values):
        """Warn (do not hard-fail) if Groq is the active provider without a key.

        The app must still boot so the UI can surface a helpful "missing API key"
        message. Requests that actually hit the LLM will raise a clear error.
        """
        if values.get('LLM_PROVIDER') == 'groq' and not v:
            print("WARNING: LLM_PROVIDER is 'groq' but GROQ_API_KEY is not set. "
                  "Chat/query endpoints will return a clear error until a key is configured.")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


# Create settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get settings instance (for dependency injection)"""
    return settings
