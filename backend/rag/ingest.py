import argparse
import asyncio
import hashlib
import json
import os
import uuid
from pathlib import Path
from typing import Any, Dict, List, Tuple

from dotenv import load_dotenv
from litellm import embedding as litellm_embedding
from sqlalchemy import text

try:
    from backend.rag.database import AsyncSessionLocal, KnowledgeNugget
    from backend.rag.harvester import get_gemini_client_and_model, identify_winning_triads, normalize_triad
except ImportError:
    from rag.database import AsyncSessionLocal, KnowledgeNugget
    from rag.harvester import get_gemini_client_and_model, identify_winning_triads, normalize_triad

load_dotenv()


def _normalize_program_identifier(payload: Dict[str, Any], source_file: Path) -> str:
    raw = str(payload.get("url") or payload.get("program", {}).get("url") or "").strip().lower()
    if not raw:
        raw = str(payload.get("program", {}).get("program_name") or source_file.stem).strip().lower()
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _infer_source_agent(payload: Dict[str, Any], source_file: Path) -> str:
    mode = str(payload.get("mode", "")).strip().lower()
    if mode in {"human_vs_ai", "agent_powered_human_vs_ai"}:
        return "human"
    if "human_vs_ai" in source_file.name.lower():
        return "human"
    return "ai"


def _extract_embedding_vector(response: Any) -> List[float]:
    data = getattr(response, "data", None)
    if not data and isinstance(response, dict):
        data = response.get("data")
    if not data:
        raise RuntimeError("Embedding response did not contain data.")
    first = data[0]
    vector = getattr(first, "embedding", None)
    if vector is None and isinstance(first, dict):
        vector = first.get("embedding")
    if not vector:
        raise RuntimeError("Embedding vector missing from response.")
    return [float(v) for v in vector]


def _azure_embed(text_input: str) -> List[float]:
    endpoint = os.getenv("AZURE_OPENAI_ENDPOINT", "").strip()
    api_key = os.getenv("AZURE_OPENAI_API_KEY", "").strip()
    deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "").strip()
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01").strip()
    if not endpoint or not api_key or not deployment:
        raise RuntimeError("Missing Azure OpenAI embedding configuration in environment.")

    response = litellm_embedding(
        model=f"azure/{deployment}",
        input=[text_input],
        api_base=endpoint,
        api_key=api_key,
        api_version=api_version,
    )
    return _extract_embedding_vector(response)


async def _run_migration_sql() -> None:
    migration_file = Path(__file__).with_name("migrations") / "001_create_knowledge_nuggets.sql"
    sql_text = migration_file.read_text(encoding="utf-8")
    async with AsyncSessionLocal() as session:
        async with session.begin():
            for statement in sql_text.split(";"):
                command = statement.strip()
                if command:
                    await session.execute(text(command))


async def ingest_trace_payload(payload: Dict[str, Any], source_name: str = "traceability.json") -> Tuple[int, List[Dict[str, Any]]]:
    messages = payload.get("history_for_reporting") or payload.get("transcript") or []
    if not isinstance(messages, list):
        raise RuntimeError("Invalid traceability payload: transcript/history_for_reporting must be a list.")

    triads = identify_winning_triads(messages)
    if not triads:
        return 0, []

    gemini_client, gemini_model = get_gemini_client_and_model()
    source_path = Path(source_name)
    program_hash = _normalize_program_identifier(payload, source_path)
    source_agent = _infer_source_agent(payload, source_path)
    persona_archetype = str(payload.get("persona", {}).get("archetype_id", "unknown")).strip()

    inserted = 0
    inserted_nuggets: List[Dict[str, Any]] = []
    async with AsyncSessionLocal() as session:
        for triad in triads:
            normalized = normalize_triad(gemini_client, gemini_model, triad)
            vector = _azure_embed(normalized["trigger"])

            nugget = KnowledgeNugget(
                id=uuid.uuid4(),
                program_id_hash=program_hash,
                semantic_trigger=normalized["trigger"],
                embedding=vector,
                counsellor_response=normalized["response"],
                technique_label=normalized["technique"] or "Objection Handling",
                source_agent=source_agent,
                persona_archetype=persona_archetype or "unknown",
                outcome_metrics={
                    "trust_delta": triad.trust_delta,
                    "skepticism_delta": triad.skepticism_delta,
                    "trigger_round": triad.trigger_message.get("round"),
                    "reaction_round": triad.reaction_message.get("round"),
                },
                similarity_score=None,
            )
            session.add(nugget)
            inserted += 1
            inserted_nuggets.append(
                {
                    "trigger": normalized["trigger"],
                    "response": normalized["response"],
                    "technique": normalized["technique"] or "Objection Handling",
                    "trust_delta": triad.trust_delta,
                    "skepticism_delta": triad.skepticism_delta,
                    "round": triad.trigger_message.get("round"),
                }
            )
        await session.commit()
    return inserted, inserted_nuggets


async def ingest_trace_file(file_path: Path) -> int:
    payload = json.loads(file_path.read_text(encoding="utf-8"))
    inserted, _ = await ingest_trace_payload(payload, source_name=file_path.name)
    return inserted


def main() -> None:
    parser = argparse.ArgumentParser(description="Ingest winning triads from a traceability JSON file.")
    parser.add_argument("--file", required=True, help="Path to conversation_traceability.json")
    parser.add_argument("--migrate", action="store_true", help="Run DB migration SQL before ingest.")
    args = parser.parse_args()

    file_path = Path(args.file).resolve()
    if not file_path.exists():
        raise SystemExit(f"File not found: {file_path}")

    async def _runner() -> None:
        if args.migrate:
            await _run_migration_sql()
        count = await ingest_trace_file(file_path)
        print(f"Ingestion complete. knowledge_nuggets inserted: {count}")

    asyncio.run(_runner())


if __name__ == "__main__":
    main()
