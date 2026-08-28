import os
from typing import List, Dict, Any, Optional, Iterator
from datetime import datetime
import json

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

from app.config import settings
from app.schemas.response import Citation, TroubleshootingStep, ValidationResult


class Answer:
    """Represents an AI-generated answer"""
    def __init__(self, text: str, citations: List[Citation] = None, reasoning: str = ""):
        self.text = text
        self.citations = citations or []
        self.reasoning = reasoning


class GroqProvider:
    """Groq API provider for LLM integration"""
    
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.GROQ_API_KEY
        self.model = model or settings.GROQ_MODEL
        self.client = None
        
        if not GROQ_AVAILABLE:
            raise ImportError("groq package not available. Install with: pip install groq")
        
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is required for Groq provider")
        
        self.client = Groq(api_key=self.api_key)
    
    def generate(self, prompt: str, system_prompt: str = None, 
                temperature: float = 0.7, max_tokens: int = 2048) -> str:
        """Generate response using Groq API"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating response with Groq: {e}")
            raise
    
    def stream(self, prompt: str, system_prompt: str = None,
              temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        """Stream response using Groq API"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            print(f"Error streaming response with Groq: {e}")
            raise


class OpenAIProvider:
    """OpenAI API provider (fallback option)"""
    
    def __init__(self, api_key: str = None, model: str = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.client = None
        
        if not OPENAI_AVAILABLE:
            raise ImportError("openai package not available. Install with: pip install openai")
        
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is required for OpenAI provider")
        
        self.client = OpenAI(api_key=self.api_key)
    
    def generate(self, prompt: str, system_prompt: str = None,
                temperature: float = 0.7, max_tokens: int = 2048) -> str:
        """Generate response using OpenAI API"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error generating response with OpenAI: {e}")
            raise
    
    def stream(self, prompt: str, system_prompt: str = None,
              temperature: float = 0.7, max_tokens: int = 2048) -> Iterator[str]:
        """Stream response using OpenAI API"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            print(f"Error streaming response with OpenAI: {e}")
            raise


class AIService:
    """AI service for generating troubleshooting responses"""
    
    def __init__(self, provider: str = None):
        self.provider = provider or settings.LLM_PROVIDER
        self.provider_instance = None
        self._initialize_provider()
    
    def _initialize_provider(self):
        """Initialize the selected LLM provider"""
        if self.provider == 'groq':
            self.provider_instance = GroqProvider()
        elif self.provider == 'openai':
            self.provider_instance = OpenAIProvider()
        else:
            raise ValueError(f"Unsupported provider: {self.provider}. Use 'groq' or 'openai'")
    
    def generate_answer(self, query: str, context: str, 
                       model_params: Dict[str, Any] = None) -> Answer:
        """Generate an answer with citations"""
        model_params = model_params or {}
        
        # System prompt
        system_prompt = """You are an expert industrial equipment troubleshooting assistant. Your role is to:
1. Analyze technical problems with industrial equipment
2. Provide clear, step-by-step troubleshooting guidance
3. Base all answers on the provided technical documentation
4. Cite specific sections when providing guidance
5. Be honest about limitations and when expert help is needed

When providing answers:
- Format responses clearly with sections and bullet points
- Number troubleshooting steps sequentially
- Include safety warnings if applicable
- Reference specific page numbers and equipment names
- Explain the reasoning behind each step"""
        
        # User prompt with context
        user_prompt = f"""Technical Documentation:
{context}

User Question:
{query}

Provide a detailed, citation-backed answer referencing the documentation above."""
        
        try:
            # Generate response
            response_text = self.provider_instance.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=model_params.get('temperature', 0.7),
                max_tokens=model_params.get('max_tokens', 2048)
            )
            
            # Extract citations from response
            citations = self._extract_citations(response_text, context)
            
            return Answer(text=response_text, citations=citations)
            
        except Exception as e:
            print(f"Error generating answer: {e}")
            raise
    
    def generate_troubleshooting_chain(self, problem: str, context: str) -> Dict[str, Any]:
        """Generate a structured troubleshooting chain"""
        system_prompt = """You are an expert industrial equipment troubleshooting assistant.
Generate a structured troubleshooting response with:
1. Problem identification
2. Root cause analysis
3. Step-by-step diagnostic procedures
4. Resolution steps
5. Verification procedures

Format your response as JSON with the following structure:
{
  "problem": "description",
  "root_causes": ["cause1", "cause2"],
  "steps": [
    {"step": 1, "action": "action description", "expected": "expected result"}
  ],
  "citations": [{"source": "document", "page": number, "excerpt": "text"}]
}"""
        
        user_prompt = f"""Problem: {problem}

Technical Documentation:
{context}

Generate a structured troubleshooting chain as JSON."""
        
        try:
            response_text = self.provider_instance.generate(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.5,
                max_tokens=2048
            )
            
            # Try to parse JSON response
            try:
                # Extract JSON from response (in case there's extra text)
                json_start = response_text.find('{')
                json_end = response_text.rfind('}') + 1
                if json_start != -1 and json_end > json_start:
                    json_text = response_text[json_start:json_end]
                    troubleshooting_data = json.loads(json_text)
                else:
                    # Fallback: create structured response from text
                    troubleshooting_data = self._parse_troubleshooting_text(response_text)
            except json.JSONDecodeError:
                troubleshooting_data = self._parse_troubleshooting_text(response_text)
            
            return troubleshooting_data
            
        except Exception as e:
            print(f"Error generating troubleshooting chain: {e}")
            raise
    
    def _parse_troubleshooting_text(self, text: str) -> Dict[str, Any]:
        """Parse troubleshooting text into structured format"""
        # Simple parsing as fallback
        lines = text.split('\n')
        steps = []
        current_step = 1
        
        for line in lines:
            if line.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
                parts = line.split('.', 1)
                if len(parts) > 1:
                    steps.append({
                        "step": current_step,
                        "action": parts[1].strip(),
                        "expected": "Verify completion"
                    })
                    current_step += 1
        
        return {
            "problem": text[:200],
            "root_causes": ["Analysis required"],
            "steps": steps,
            "citations": []
        }
    
    def _extract_citations(self, response_text: str, context: str) -> List[Citation]:
        """Extract citations from response text and context"""
        citations = []
        
        # Simple citation extraction based on patterns like "Page X" or "Document Y"
        # This is a simplified implementation
        
        # Look for page references
        import re
        page_pattern = r'(?:page|p\.?)\s*(\d+)'
        page_matches = re.findall(page_pattern, response_text, re.IGNORECASE)
        
        for page_num in page_matches:
            citations.append(Citation(
                source_doc="Technical Documentation",
                page=int(page_num),
                excerpt="Referenced in documentation",
                confidence=0.8
            ))
        
        return citations
    
    def generate_citations(self, answer_text: str, context_chunks: List[str]) -> List[Citation]:
        """Generate citations for an answer based on context chunks"""
        citations = []
        
        # Simple citation generation based on content overlap
        for i, chunk in enumerate(context_chunks):
            # Check if chunk content is referenced in answer
            chunk_words = set(chunk.lower().split())
            answer_words = set(answer_text.lower().split())
            
            overlap = len(chunk_words & answer_words)
            if overlap > 5:  # Threshold for citation
                citations.append(Citation(
                    source_doc=f"Document {i+1}",
                    page=1,
                    excerpt=chunk[:200],
                    confidence=min(overlap / len(answer_words), 1.0)
                ))
        
        return citations
    
    def validate_answer(self, answer: Answer, context: str) -> ValidationResult:
        """Validate an answer against the provided context"""
        issues = []
        confidence_score = 1.0
        
        # Check if answer is empty
        if not answer.text.strip():
            issues.append("Answer is empty")
            confidence_score = 0.0
        
        # Check if answer is too short
        if len(answer.text) < 50:
            issues.append("Answer is too short")
            confidence_score *= 0.5
        
        # Check if citations are present
        if not answer.citations:
            issues.append("No citations provided")
            confidence_score *= 0.7
        
        # Check if answer contains disclaimer about limitations
        disclaimer_keywords = ['limited', 'insufficient', 'unable', 'not enough information']
        if any(keyword in answer.text.lower() for keyword in disclaimer_keywords):
            issues.append("Answer indicates limited information")
            confidence_score *= 0.8
        
        return ValidationResult(
            is_valid=len(issues) == 0,
            issues=issues,
            confidence_score=confidence_score
        )
    
    def stream_response(self, query: str, context: str, 
                       model_params: Dict[str, Any] = None) -> Iterator[Dict[str, Any]]:
        """Stream a response token by token"""
        model_params = model_params or {}
        
        system_prompt = """You are an expert industrial equipment troubleshooting assistant.
Provide clear, step-by-step troubleshooting guidance based on the provided documentation."""
        
        user_prompt = f"""Technical Documentation:
{context}

User Question:
{query}

Provide a detailed answer."""
        
        try:
            for token in self.provider_instance.stream(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=model_params.get('temperature', 0.7),
                max_tokens=model_params.get('max_tokens', 2048)
            ):
                yield {
                    "content": token,
                    "type": "token"
                }
            
            # Signal completion
            yield {
                "content": "",
                "type": "done"
            }
            
        except Exception as e:
            print(f"Error streaming response: {e}")
            yield {
                "content": f"Error: {str(e)}",
                "type": "error"
            }
    
    def switch_provider(self, new_provider: str):
        """Switch to a different LLM provider"""
        self.provider = new_provider
        self._initialize_provider()
