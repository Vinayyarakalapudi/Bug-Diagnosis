import logging

from app.ai.llm import chat_json
from app.ai.state import DiagnosisState

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Code Analysis Agent inside an automated software diagnosis \
pipeline. Given source code (possibly multiple files concatenated with "===== FILE: ... ====="
markers) and a bug category identified by a previous agent, you locate the most likely \
problematic file/function and describe concrete coding mistakes. Be specific and reference \
actual function/variable names visible in the code when possible."""


def run_code_analysis_agent(state: DiagnosisState) -> DiagnosisState:
    content = state.get("raw_content", "")[:10000]
    bug_category = state.get("bug_category", "Unknown")
    exception_type = state.get("exception_type", "N/A")

    user_prompt = f"""A previous agent classified this issue as: "{bug_category}" \
(exception type: {exception_type}).

Here is the source code / project content to analyze:
{content}

Return a JSON object with exactly these fields:
- "probable_file": the filename most likely responsible (from a "===== FILE: ... =====" marker if present, else the given filename, else "unknown")
- "probable_function": the function/method name most likely responsible, else "unknown"
- "problematic_functions": array of up to 5 function/method names that look suspicious or risky
- "coding_mistakes": array of up to 6 short, specific descriptions of coding mistakes found (e.g. "getUser() does not null-check the DB result before calling .getName()")
"""

    result = chat_json(SYSTEM_PROMPT, user_prompt)

    return {
        **state,
        "probable_file": result.get("probable_file", state.get("filename", "unknown")),
        "probable_function": result.get("probable_function", "unknown"),
        "problematic_functions": result.get("problematic_functions", []) or [],
        "coding_mistakes": result.get("coding_mistakes", []) or [],
    }
