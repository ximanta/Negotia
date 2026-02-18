import argparse
import asyncio
import os
from typing import Any, List

from dotenv import load_dotenv
from litellm import embedding as litellm_embedding
from sqlalchemy import select

try:
    from backend.rag.database import AsyncSessionLocal, KnowledgeNugget
except ImportError:
    from rag.database import AsyncSessionLocal, KnowledgeNugget

load_dotenv()


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


async def query_similar(text_input: str, top_k: int) -> None:
    query_vec = _azure_embed(text_input)
    async with AsyncSessionLocal() as session:
        stmt = (
            select(
                KnowledgeNugget.technique_label,
                KnowledgeNugget.semantic_trigger,
                KnowledgeNugget.counsellor_response,
                KnowledgeNugget.outcome_metrics,
                KnowledgeNugget.embedding.cosine_distance(query_vec).label("distance"),
            )
            .order_by(KnowledgeNugget.embedding.cosine_distance(query_vec))
            .limit(top_k)
        )
        rows = (await session.execute(stmt)).all()

    if not rows:
        print("No knowledge nuggets found.")
        return

    print(f"Top {len(rows)} matches for: {text_input}")
    for idx, row in enumerate(rows, start=1):
        print("-" * 48)
        print(f"{idx}. distance={row.distance:.4f} technique={row.technique_label}")
        print(f"   trigger: {row.semantic_trigger}")
        print(f"   response: {row.counsellor_response}")
        print(f"   outcome_metrics: {row.outcome_metrics}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Vector similarity query test for knowledge nuggets.")
    parser.add_argument("--text", default="The fees are too high.", help="Query text")
    parser.add_argument("--top-k", type=int, default=3, help="Number of matches")
    args = parser.parse_args()

    asyncio.run(query_similar(args.text, max(1, args.top_k)))


if __name__ == "__main__":
    main()
