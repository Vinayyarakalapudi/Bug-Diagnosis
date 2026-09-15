import logging
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, UploadFile, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.ai.graph import run_diagnosis_pipeline
from app.models.analysis import analysis_doc_to_out, new_analysis_document
from app.rag.document_processor import extract_text
from app.rag.vector_store import add_bug_record
from app.schemas.analysis import AnalysisOut, AnalysisSummary, DashboardStats
from app.utils.file_utils import classify_file_type, validate_file_size, validate_upload_file

logger = logging.getLogger(__name__)


class AnalysisService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.analyses = db["analyses"]

    async def analyze_upload(self, file: UploadFile, user_id: str) -> AnalysisOut:
        validate_upload_file(file)
        file_bytes = await file.read()
        validate_file_size(len(file_bytes))

        file_type = classify_file_type(file.filename)
        text = extract_text(file.filename, file_bytes)
        if not text.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract any readable content from this file.",
            )

        doc = new_analysis_document(user_id=user_id, filename=file.filename, file_type=file_type, status="processing")
        result = await self.analyses.insert_one(doc)
        analysis_id = str(result.inserted_id)

        try:
            final_state = run_diagnosis_pipeline(
                filename=file.filename,
                file_type=file_type,
                raw_content=text,
                user_id=user_id,
            )
            update = {
                "status": "completed",
                "error_type": final_state.get("error_type"),
                "root_cause": final_state.get("root_cause"),
                "severity": final_state.get("severity"),
                "confidence_score": final_state.get("confidence_score"),
                "probable_file": final_state.get("probable_file"),
                "probable_function": final_state.get("probable_function"),
                "possible_reasons": final_state.get("possible_reasons", []),
                "explanation": final_state.get("explanation"),
                "step_by_step_fix": final_state.get("step_by_step_fix", []),
                "best_practices": final_state.get("best_practices", []),
                "improved_code": final_state.get("improved_code"),
                "alternative_solutions": final_state.get("alternative_solutions", []),
                "updated_at": datetime.now(timezone.utc),
            }
            await self.analyses.update_one({"_id": result.inserted_id}, {"$set": update})

            summary_text = f"{update['error_type']}: {update['root_cause']}"
            try:
                add_bug_record(
                    analysis_id=analysis_id,
                    summary_text=summary_text,
                    error_type=update["error_type"],
                    root_cause=update["root_cause"],
                    user_id=user_id,
                )
            except Exception:
                logger.exception("Failed to store bug record in vector store for %s", analysis_id)

        except Exception:
            logger.exception("Diagnosis pipeline failed for analysis %s", analysis_id)
            await self.analyses.update_one(
                {"_id": result.inserted_id},
                {"$set": {"status": "failed", "updated_at": datetime.now(timezone.utc)}},
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="The AI diagnosis pipeline failed to process this file. Please try again.",
            )

        final_doc = await self.analyses.find_one({"_id": result.inserted_id})
        return AnalysisOut(**analysis_doc_to_out(final_doc))

    async def get_analysis(self, analysis_id: str, user_id: str) -> AnalysisOut:
        doc = await self._find_owned(analysis_id, user_id)
        return AnalysisOut(**analysis_doc_to_out(doc))

    async def list_history(self, user_id: str, limit: int = 50) -> list[AnalysisSummary]:
        cursor = self.analyses.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        return [AnalysisSummary(**analysis_doc_to_out(d)) for d in docs]

    async def get_dashboard_stats(self, user_id: str) -> DashboardStats:
        total = await self.analyses.count_documents({"user_id": user_id})
        week_ago = datetime.now(timezone.utc) - timedelta(days=7)
        this_week = await self.analyses.count_documents({"user_id": user_id, "created_at": {"$gte": week_ago}})

        bug_type_breakdown: dict[str, int] = {}
        severity_breakdown: dict[str, int] = {}
        async for d in self.analyses.find({"user_id": user_id, "status": "completed"}):
            et = d.get("error_type") or "Unknown"
            sev = d.get("severity") or "unknown"
            bug_type_breakdown[et] = bug_type_breakdown.get(et, 0) + 1
            severity_breakdown[sev] = severity_breakdown.get(sev, 0) + 1

        recent_docs = await self.analyses.find({"user_id": user_id}).sort("created_at", -1).limit(5).to_list(length=5)
        recent = [AnalysisSummary(**analysis_doc_to_out(d)) for d in recent_docs]

        return DashboardStats(
            total_analyses=total,
            total_uploaded_files=total,
            analyses_this_week=this_week,
            bug_type_breakdown=bug_type_breakdown,
            severity_breakdown=severity_breakdown,
            recent_analyses=recent,
        )

    async def _find_owned(self, analysis_id: str, user_id: str) -> dict:
        try:
            oid = ObjectId(analysis_id)
        except InvalidId:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

        doc = await self.analyses.find_one({"_id": oid, "user_id": user_id})
        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")
        return doc
