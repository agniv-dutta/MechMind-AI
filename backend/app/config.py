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
    GROQ_MODEL: str = Field(default="llama3-70b-8192", description="Groq model name")
    
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
        """Validate Groq API key if Groq is the provider"""
        if values.get('LLM_PROVIDER') == 'groq' and not v:
            raise ValueError("GROQ_API_KEY is required when LLM_PROVIDER is 'groq'")
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
