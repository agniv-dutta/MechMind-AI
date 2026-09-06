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
    
    def test_connection(self, max_tokens: int = 8) -> dict:
        """Ping Groq with a minimal completion and return status + latency."""
        import time
        start = time.monotonic()
        self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": "ping"}],
            temperature=0,
            max_tokens=max_tokens
        )
        latency_ms = (time.monotonic() - start) * 1000
        return {"success": True, "model": self.model, "latency_ms": round(latency_ms, 1)}
    
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


class OfflineProvider:
    """Deterministic local fallback used when Groq is selected but no API key is set.

    Produces a citation-style answer assembled from the retrieved documentation
    chunks so the app remains fully usable offline. Every response carries a
    clear 'offline mode' banner. When GROQ_API_KEY is configured, GroqProvider is
    used instead and this class is never invoked.
    """

    MODE_LABEL = "offline"

    def __init__(self, model: str = "local-fallback"):
        self.model = model
        self.api_key = None

    @staticmethod
    def _key_sentences(text: str, query: str, max_sentences: int = 4):
        sentences = [s.strip() for s in text.replace("\n", " ").split(". ") if s.strip()]
        query_terms = set(query.lower().replace("?", "").split())
        scored = []
        for s in sentences:
            words = set(s.lower().split())
            score = len(words & query_terms)
            scored.append((score, s))
        scored.sort(key=lambda x: x[0], reverse=True)
        picked = [s for s_t, s in scored if s_t > 0][:max_sentences]
        if not picked:
            picked = [s for _, s in scored[:2]]
        return picked

    @staticmethod
    def assemble_answer(query: str, context: str, sources) -> str:
        import re
        lines = [
            "> **Offline mode** \u2014 GROQ_API_KEY is not configured, so this answer was built "
            "directly from your uploaded documentation instead of a live LLM. Configure a Groq "
            "API key to enable full AI-generated responses.",
        ]
        # Extract per-chunk blocks from the RAG prompt
        blocks = []
        for match in re.split(r"\[DOCUMENT:\s*([^,\]]+)(?:,\s*PAGE:\s*(\d+))?\]", context):
            blocks.append(match)
        # blocks interleave: pre, name, page, body, name, page, body...
        chunks = []
        i = 1
        while i < len(blocks):
            name = (blocks[i] or "").strip()
            page = (blocks[i + 1] or "").strip()
            body = (blocks[i + 2] or "").strip() if i + 2 < len(blocks) else ""
            if body:
                chunks.append({"name": name, "page": page, "body": body})
            i += 3

        # Fallback: split on "---" blocks produced by format_context_for_llm
        if not chunks and "---" in context:
            for chunk in context.split("---"):
                body = "\n".join(
                    ln for ln in chunk.splitlines()
                    if not ln.startswith(("Source", "Relevance", "Content:"))
                ).strip()
                if body:
                    chunks.append({"name": "", "page": "", "body": body})

        if chunks:
            seen = set()
            for chunk in chunks:
                source_label = chunk["name"] or (next((s[0] for s in sources if True), "") if sources else "")
                if chunk["page"]:
                    source_label += f" (Page {chunk['page']})"
                for sentence in OfflineProvider._key_sentences(chunk["body"], query):
                    key = sentence[:80]
                    if key in seen:
                        continue
                    seen.add(key)
                    pointer = f"  _[{source_label}]_" if source_label else ""
                    lines.append(f"- {sentence}{pointer}")
        else:
            lines.append("No matching documentation was found for this query. "
                         "Try uploading relevant manuals or rephrasing the question.")

        if sources:
            unique = list(dict.fromkeys(s[0] for s in sources))
            lines.append("")
            lines.append(f"**Relevant sources:** {', '.join(unique)}")

        lines.append("\nIf the issue persists, involve maintenance personnel and follow safe "
                     "work practices. Always lock out/tag out equipment before servicing.")
        return "\n".join(lines)

    def generate(self, prompt: str, system_prompt: str = None,
                 temperature: float = 0.7, max_tokens: int = 2048) -> str:
        context, query, sources = self._parse_rag_prompt(prompt)
        return self.assemble_answer(query, context, sources)

    def stream(self, prompt: str, system_prompt: str = None,
               temperature: float = 0.7, max_tokens: int = 2048):
        text = self.generate(prompt, system_prompt, temperature, max_tokens)
        for i in range(0, len(text), 48):
            yield text[i:i + 48]

    def _parse_rag_prompt(self, prompt: str):
        """Split a RAG user prompt into (context, query, sources)."""
        context = prompt
        query = prompt
        sources = []
        doc_marker = "Technical Documentation:"
        q_marker = "User Question:"
        provider_marker = "Provide a"
        if q_marker in prompt:
            context = prompt.split(doc_marker, 1)[1].split(q_marker, 1)[0] if doc_marker in prompt else prompt.split(q_marker, 1)[0]
            rest = prompt.split(q_marker, 1)[1]
            query = rest.split(provider_marker)[0].strip() if provider_marker in rest else rest.strip()
        # Extract [DOCUMENT: ...] source lines
        import re
        for m in re.finditer(r"\[DOCUMENT:\s*([^,\]]+)(?:,\s*PAGE:\s*(\d+))?\]", context):
            name = m.group(1).strip()
            page = m.group(2)
            sources.append((name, int(page) if page else 1))
        return context, query, sources

    def test_connection(self) -> dict:
        return {
            "success": False,
            "model": self.model,
            "message": "GROQ_API_KEY is not configured \u2014 running in offline mode"
        }

    def structured_chain(self, problem: str, context: str) -> Dict[str, Any]:
        """Build a deterministic troubleshooting chain from retrieved docs."""
        root_cause_terms = [
            ("Cavitation", ["cavitation"]),
            ("Worn or damaged bearing", ["bearing", "vibration"]),
            ("Failing mechanical seal", ["seal", "leak", "leakage"]),
            ("Misalignment of pump and motor", ["alignment", "shaft"]),
            ("Clogged suction line or strainer", ["suction", "strainer", "clog"]),
            ("Worn impeller or excessive clearance", ["impeller", "wear ring", "clearance"]),
            ("Electrical / motor fault", ["motor overload", "current", "voltage"]),
        ]
        root_causes = []
        lower = (problem + " " + context).lower()
        for label, terms in root_cause_terms:
            if any(t in lower for t in terms):
                root_causes.append(label)

        lines = [
            "Inspect the equipment in a safe sequence. Confirm the reported issue and compare "
            "current readings (temperature, pressure, current, vibration) to normal values.",
        ]
        base_steps = [
            "Lock out / tag out the equipment and disconnect the drive before inspection.",
            "Check suction and discharge conditions; confirm the strainer is clear and there is no air ingestion.",
            "Monitor vibration and temperature at the pump housing and motor bearing.",
            "Inspect seals, gaskets, and wear parts for leakage or damage; replace as needed.",
            "Verify shaft alignment and bearing condition; replace worn bearings.",
            "Restart and confirm readings return to normal operating ranges.",
        ]
        if root_causes:
            lines.insert(1, "Likely root causes identified from documentation: " + "; ".join(root_causes) + ".")
        steps = []
        for i, action in enumerate(base_steps, start=1):
            steps.append({
                "step": i,
                "action": action,
                "expected": "Readings within normal range; no leakage"
            })
        return {
            "problem": problem,
            "root_causes": root_causes or ["Marginal documentation coverage \u2014 verify with maintenance team"],
            "steps": steps,
            "citations": [
                {"source": n, "page": p, "excerpt": s}
                for n, p in self._get_source_pairs(context)[:3]
            ],
        }

    def _get_source_pairs(self, context: str):
        import re
        return [(m.group(1).strip(), int(m.group(2)) if m.group(2) else 1)
                for m in re.finditer(r"\[DOCUMENT:\s*([^,\]]+)(?:,\s*PAGE:\s*(\d+))?\]", context)]


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
    
    def __init__(self, provider: str = None, model: str = None):
        # Honor persisted runtime overrides when explicit values are not given
        from app.services.llm_config import load_llm_config
        overrides = load_llm_config()
        self.provider = provider or overrides.get('provider') or settings.LLM_PROVIDER
        self.model = model or overrides.get('model') or settings.GROQ_MODEL
        self.provider_instance = None
        self._initialize_provider()
    
    def _initialize_provider(self):
        """Initialize the selected LLM provider"""
        if self.provider == 'groq':
            if not settings.GROQ_API_KEY:
                print("WARNING: GROQ_API_KEY not set - using OfflineProvider fallback.")
                self.provider_instance = OfflineProvider(model=self.model)
            else:
                self.provider_instance = GroqProvider(model=self.model)
        elif self.provider == 'openai':
            self.provider_instance = OpenAIProvider(model=self.model)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}. Use 'groq' or 'openai'")
    
    def test_connection(self) -> dict:
        """Verify the configured LLM provider is reachable"""
        if not hasattr(self.provider_instance, 'test_connection'):
            return {"success": False, "message": "Provider does not support connection testing"}
        return self.provider_instance.test_connection()
    
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
        if isinstance(self.provider_instance, OfflineProvider):
            return self.provider_instance.structured_chain(problem, context)
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
