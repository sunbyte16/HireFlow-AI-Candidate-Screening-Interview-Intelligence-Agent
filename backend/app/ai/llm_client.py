import json
import logging
import re
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMClient:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY
        self.provider = settings.DEFAULT_LLM_PROVIDER
        
        # Initialize clients if keys exist
        self._gemini_client = None
        self._openai_client = None

        if self.gemini_key:
            try:
                from google import genai
                self._gemini_client = genai.Client(api_key=self.gemini_key)
                logger.info("Google GenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize Google GenAI client: {e}")

        if self.openai_key:
            try:
                from openai import OpenAI
                self._openai_client = OpenAI(api_key=self.openai_key)
                logger.info("OpenAI client initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")

    def is_live(self) -> bool:
        """Returns True if a live AI provider is configured and available."""
        if self.provider == "gemini" and self._gemini_client:
            return True
        if self.provider == "openai" and self._openai_client:
            return True
        return bool(self._gemini_client or self._openai_client)

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """
        Sends a prompt requesting a JSON object and parses the result.
        Returns parsed dict or None if LLM is unavailable/fails.
        """
        if not self.is_live():
            return None

        full_system = (system_prompt or "") + "\nYou MUST respond with ONLY valid JSON without markdown formatting or code fences."

        # Try Gemini first if configured
        if self._gemini_client and (self.provider == "gemini" or not self._openai_client):
            try:
                response = self._gemini_client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=f"{full_system}\n\nTask:\n{prompt}",
                )
                text = response.text.strip()
                return self._clean_and_parse_json(text)
            except Exception as e:
                logger.error(f"Gemini API error: {e}. Falling back...")

        # Try OpenAI if configured
        if self._openai_client:
            try:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": full_system})
                messages.append({"role": "user", "content": prompt})

                response = self._openai_client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    response_format={"type": "json_object"}
                )
                content = response.choices[0].message.content
                return self._clean_and_parse_json(content)
            except Exception as e:
                logger.error(f"OpenAI API error: {e}")

        return None

    def _clean_and_parse_json(self, raw: str) -> Optional[Dict[str, Any]]:
        cleaned = raw.strip()
        # Remove markdown fences ```json ... ```
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode failed on: {cleaned[:100]}... Error: {e}")
            # Try regex to extract first { ... }
            match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(1))
                except Exception:
                    pass
            return None

llm_client = LLMClient()
