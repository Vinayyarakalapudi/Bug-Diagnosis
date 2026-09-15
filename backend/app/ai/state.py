from typing import TypedDict


class DiagnosisState(TypedDict, total=False):
    # Inputs
    filename: str
    file_type: str          # "code" | "log" | "stacktrace" | "project"
    raw_content: str
    user_id: str

    # Agent 1: Bug Detection
    bug_category: str
    exception_type: str
    exception_message: str
    detected_severity: str

    # Agent 2: Code Analysis
    problematic_functions: list[str]
    coding_mistakes: list[str]
    probable_file: str
    probable_function: str

    # Agent 3: Knowledge Retrieval
    knowledge_context: list[dict]
    similar_bugs: list[dict]

    # Agent 4: Fix Recommendation (final output)
    error_type: str
    root_cause: str
    severity: str
    confidence_score: float
    possible_reasons: list[str]
    explanation: str
    step_by_step_fix: list[str]
    best_practices: list[str]
    improved_code: str
    alternative_solutions: list[str]
