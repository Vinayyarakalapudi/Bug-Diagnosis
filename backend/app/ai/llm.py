import json
import logging
import re

from langchain_core.messages import HumanMessage, SystemMessage

from app.config import settings

logger = logging.getLogger(__name__)

_llm = None


def get_llm():
    """Return a cached LangChain chat model for the configured provider."""
    global _llm
    if _llm is not None:
        return _llm

    if settings.LLM_PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI

        _llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GEMINI_API_KEY,
            temperature=0.2,
        )
    else:
        from langchain_groq import ChatGroq

        _llm = ChatGroq(
            model=settings.GROQ_MODEL,
            api_key=settings.GROQ_API_KEY,
            temperature=0.2,
        )
    return _llm


def chat(system_prompt: str, user_prompt: str) -> str:
    """Send a single-turn prompt to the configured LLM and return the raw text response."""
    llm = get_llm()
    messages = [SystemMessage(content=system_prompt), HumanMessage(content=user_prompt)]
    response = llm.invoke(messages)
    return response.content if hasattr(response, "content") else str(response)


def chat_json(system_prompt: str, user_prompt: str) -> dict:
    """Call the LLM and parse a JSON object from its response.

    Instructs the model to respond with JSON only, then defensively extracts the
    first {...} block in case the model wraps it in prose or markdown fences.
    """
    json_instruction = (
        "\n\nRespond with ONLY a single valid JSON object. "
        "Do not include markdown code fences, explanations, or any text outside the JSON."
    )
    raw = chat(system_prompt + json_instruction, user_prompt)
    return _extract_json(raw)


def _extract_json(raw: str) -> dict:
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            logger.warning("Failed to parse JSON from LLM response: %s", raw[:500])

    return {}
