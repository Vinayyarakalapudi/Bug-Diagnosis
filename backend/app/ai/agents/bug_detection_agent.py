import logging

from app.ai.llm import chat_json
from app.ai.state import DiagnosisState

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Bug Detection Agent inside an automated software diagnosis \
pipeline. You read raw logs, stack traces, or error output and identify what went wrong at \
a high level. You do not propose fixes - that is another agent's job. Be precise and \
conservative: if information is missing, say so rather than guessing wildly."""


def run_bug_detection_agent(state: DiagnosisState) -> DiagnosisState:
    content = state.get("raw_content", "")[:8000]
    filename = state.get("filename", "unknown")
    file_type = state.get("file_type", "log")

    user_prompt = f"""Analyze the following {file_type} content from file "{filename}" and \
identify the bug.

CONTENT:
{content}

Return a JSON object with exactly these fields:
- "bug_category": one short phrase, e.g. "NullPointerException", "TypeError", "Off-by-one error", "Race condition", "Import error", "Configuration error", "Unknown"
- "exception_type": the specific exception/error class name if present, else "N/A"
- "exception_message": the exception's message text if present, else "N/A"
- "detected_severity": one of "critical", "high", "medium", "low" based on likely production impact
"""

    result = chat_json(SYSTEM_PROMPT, user_prompt)

    return {
        **state,
        "bug_category": result.get("bug_category", "Unknown"),
        "exception_type": result.get("exception_type", "N/A"),
        "exception_message": result.get("exception_message", "N/A"),
        "detected_severity": result.get("detected_severity", "medium"),
    }
