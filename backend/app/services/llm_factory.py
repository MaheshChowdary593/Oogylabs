import logging
import json
import httpx
from typing import AsyncGenerator, List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("lenny_assistant.llm_factory")

class LLMProviderFactory:
    """
    Unified Factory for streaming completions across Ollama (Local) and Google Gemini.
    Provides graceful fallbacks and provider status checks.
    """

    @staticmethod
    async def get_available_providers() -> List[Dict[str, Any]]:
        providers = []
        
        # 1. Check Local Ollama
        ollama_status = False
        ollama_detail = f"Configured at {settings.OLLAMA_HOST} ({settings.OLLAMA_MODEL})"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{settings.OLLAMA_HOST}/api/tags")
                if res.status_code == 200:
                    ollama_status = True
                    ollama_detail += " [Online]"
        except Exception as e:
            ollama_detail += f" [Offline: {str(e)}]"

        providers.append({
            "id": "ollama",
            "name": f"Ollama Local ({settings.OLLAMA_MODEL})",
            "available": ollama_status,
            "is_default": settings.DEFAULT_LLM_PROVIDER == "ollama",
            "details": ollama_detail
        })

        # 2. Check Google Gemini
        gemini_status = bool(settings.GEMINI_API_KEY)
        providers.append({
            "id": "gemini",
            "name": f"Google Gemini ({settings.GEMINI_MODEL})",
            "available": gemini_status,
            "is_default": settings.DEFAULT_LLM_PROVIDER == "gemini",
            "details": "API key configured" if gemini_status else "No GEMINI_API_KEY set"
        })

        return providers

    @staticmethod
    async def stream_generate(
        prompt: str,
        system_prompt: str,
        provider: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:

        target_provider = (provider or settings.DEFAULT_LLM_PROVIDER).lower()
        logger.info(f"Generating stream using provider: '{target_provider}'")

        if target_provider == "ollama":
            async for chunk in LLMProviderFactory._stream_ollama(prompt, system_prompt, history):
                yield chunk
        elif target_provider == "gemini":
            if not settings.GEMINI_API_KEY:
                logger.warning("Gemini requested but API key missing. Falling back to Ollama.")
                yield "\n*[System Note: Gemini API key missing. Falling back to Local Ollama]*\n\n"
                async for chunk in LLMProviderFactory._stream_ollama(prompt, system_prompt, history):
                    yield chunk
            else:
                async for chunk in LLMProviderFactory._stream_gemini(prompt, system_prompt, history):
                    yield chunk
        else:
            # Default fallback
            async for chunk in LLMProviderFactory._stream_ollama(prompt, system_prompt, history):
                yield chunk

    @staticmethod
    async def _stream_ollama(
        prompt: str,
        system_prompt: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        url = f"{settings.OLLAMA_HOST}/api/chat"
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": settings.OLLAMA_MODEL,
            "messages": messages,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code != 200:
                        yield f"Error connecting to Ollama (HTTP {response.status_code}). Please ensure Ollama service is running on {settings.OLLAMA_HOST}."
                        return
                    
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                data = json.loads(line)
                                msg = data.get("message", {}).get("content", "")
                                if msg:
                                    yield msg
                            except Exception:
                                continue
        except Exception as e:
            logger.error(f"Ollama stream exception: {e}")
            yield f"\n[Ollama Connection Failure: {str(e)}]\n\n"
            yield "Note: Make sure Ollama is installed and running (`ollama serve`). You can also configure a Gemini API key in `.env` for cloud LLM support."

    @staticmethod
    async def _stream_gemini(
        prompt: str,
        system_prompt: str,
        history: Optional[List[Dict[str, str]]] = None
    ) -> AsyncGenerator[str, None]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:streamGenerateContent?key={settings.GEMINI_API_KEY}&alt=sse"
        
        contents = []
        if history:
            for h in history:
                role = "user" if h["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": h["content"]}]})
        contents.append({"role": "user", "parts": [{"text": prompt}]})

        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}]
            },
            "contents": contents
        }

        try:
            async with httpx.AsyncClient(timeout=120.0) as client:
                async with client.stream("POST", url, json=payload) as response:
                    if response.status_code != 200:
                        body = await response.aread()
                        error_detail = body.decode('utf-8', errors='ignore')
                        logger.warning(f"Gemini API returned HTTP {response.status_code}: {error_detail}. Falling back to Ollama.")
                        yield f"\n*[Notice: Google Gemini is temporarily unavailable (HTTP {response.status_code}). Seamlessly generating response via local Ollama]*\n\n"
                        async for chunk in LLMProviderFactory._stream_ollama(prompt, system_prompt, history):
                            yield chunk
                        return

                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            raw_data = line[6:].strip()
                            try:
                                data = json.loads(raw_data)
                                candidates = data.get("candidates", [])
                                if candidates:
                                    parts = candidates[0].get("content", {}).get("parts", [])
                                    if parts:
                                        text = parts[0].get("text", "")
                                        if text:
                                            yield text
                            except Exception:
                                continue
        except Exception as e:
            logger.error(f"Gemini stream exception: {e}. Falling back to Ollama.")
            yield f"\n*[Notice: Gemini connection issue ({str(e)}). Falling back to local Ollama]*\n\n"
            async for chunk in LLMProviderFactory._stream_ollama(prompt, system_prompt, history):
                yield chunk
