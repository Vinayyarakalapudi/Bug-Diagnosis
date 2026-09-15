import logging

from langgraph.graph import END, StateGraph

from app.ai.agents.bug_detection_agent import run_bug_detection_agent
from app.ai.agents.code_analysis_agent import run_code_analysis_agent
from app.ai.agents.fix_recommendation_agent import run_fix_recommendation_agent
from app.ai.agents.knowledge_retrieval_agent import run_knowledge_retrieval_agent
from app.ai.state import DiagnosisState

logger = logging.getLogger(__name__)

_compiled_graph = None


def build_diagnosis_graph():
    graph = StateGraph(DiagnosisState)

    graph.add_node("bug_detection", run_bug_detection_agent)
    graph.add_node("code_analysis", run_code_analysis_agent)
    graph.add_node("knowledge_retrieval", run_knowledge_retrieval_agent)
    graph.add_node("fix_recommendation", run_fix_recommendation_agent)

    graph.set_entry_point("bug_detection")
    graph.add_edge("bug_detection", "code_analysis")
    graph.add_edge("code_analysis", "knowledge_retrieval")
    graph.add_edge("knowledge_retrieval", "fix_recommendation")
    graph.add_edge("fix_recommendation", END)

    return graph.compile()


def get_diagnosis_graph():
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_diagnosis_graph()
    return _compiled_graph


def run_diagnosis_pipeline(
    filename: str,
    file_type: str,
    raw_content: str,
    user_id: str,
) -> DiagnosisState:
    """Run all four agents in sequence and return the final diagnosis state."""
    initial_state: DiagnosisState = {
        "filename": filename,
        "file_type": file_type,
        "raw_content": raw_content,
        "user_id": user_id,
    }
    graph = get_diagnosis_graph()
    final_state = graph.invoke(initial_state)
    return final_state
