import logging

from app.ai.llm import chat_json
from app.ai.state import DiagnosisState

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are the Fix Recommendation Agent, the final and most senior agent in \
an automated software diagnosis pipeline. You receive structured findings from three \
specialist agents (bug detection, code analysis, knowledge retrieval) and must synthesize \
them into a single, engineer-quality diagnosis and fix. Write as an experienced senior \
software engineer would in a code review or incident postmortem: precise, actionable, and \
grounded in the evidence given - never invent facts not supported by the input."""


def run_fix_recommendation_agent(state: DiagnosisState) -> DiagnosisState:
    knowledge_snippets = "\n---\n".join(
        item["content"][:400] for item in state.get("knowledge_context", [])
    ) or "No relevant documentation found in the knowledge base."

    similar_bugs_text = "\n---\n".join(
        f"[{b['metadata'].get('error_type')}] {b['content'][:300]}"
        for b in state.get("similar_bugs", [])
    ) or "No similar previously-analyzed bugs found."

    user_prompt = f"""Synthesize the following agent findings into a final diagnosis and fix.

BUG DETECTION AGENT FOUND:
- Category: {state.get('bug_category')}
- Exception type: {state.get('exception_type')}
- Exception message: {state.get('exception_message')}
- Detected severity: {state.get('detected_severity')}

CODE ANALYSIS AGENT FOUND:
- Probable file: {state.get('probable_file')}
- Probable function: {state.get('probable_function')}
- Problematic functions: {state.get('problematic_functions')}
- Coding mistakes: {state.get('coding_mistakes')}

RELEVANT KNOWLEDGE BASE CONTEXT:
{knowledge_snippets}

SIMILAR PREVIOUSLY-ANALYZED BUGS:
{similar_bugs_text}

Return a JSON object with exactly these fields:
- "error_type": concise error type name
- "root_cause": 2-4 sentence explanation of the underlying root cause
- "severity": one of "critical", "high", "medium", "low"
- "confidence_score": a number between 0 and 1 reflecting how confident you are given the evidence
- "possible_reasons": array of up to 4 alternative contributing causes worth investigating
- "explanation": a clear paragraph explaining what happened and why, for a developer unfamiliar with this bug
- "step_by_step_fix": array of ordered, concrete steps to fix the issue
- "best_practices": array of up to 4 best-practice recommendations to prevent recurrence
- "improved_code": a corrected code snippet if applicable, else an empty string
- "alternative_solutions": array of up to 3 alternative approaches to solving the problem
"""

    result = chat_json(SYSTEM_PROMPT, user_prompt)

    confidence = result.get("confidence_score", 0.5)
    try:
        confidence = max(0.0, min(1.0, float(confidence)))
    except (TypeError, ValueError):
        confidence = 0.5

    return {
        **state,
        "error_type": result.get("error_type", state.get("bug_category", "Unknown")),
        "root_cause": result.get("root_cause", "Unable to determine root cause from the provided evidence."),
        "severity": result.get("severity", state.get("detected_severity", "medium")),
        "confidence_score": confidence,
        "possible_reasons": result.get("possible_reasons", []) or [],
        "explanation": result.get("explanation", ""),
        "step_by_step_fix": result.get("step_by_step_fix", []) or [],
        "best_practices": result.get("best_practices", []) or [],
        "improved_code": result.get("improved_code", ""),
        "alternative_solutions": result.get("alternative_solutions", []) or [],
    }
