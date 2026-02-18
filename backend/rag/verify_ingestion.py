import asyncio

from sqlalchemy import func, select

try:
    from backend.rag.database import AsyncSessionLocal, KnowledgeNugget
except ImportError:
    from rag.database import AsyncSessionLocal, KnowledgeNugget


async def verify() -> None:
    async with AsyncSessionLocal() as session:
        total = await session.scalar(select(func.count()).select_from(KnowledgeNugget))
        rows = (
            await session.execute(
                select(KnowledgeNugget.technique_label, KnowledgeNugget.outcome_metrics).limit(20)
            )
        ).all()

    print(f"knowledge_nuggets count: {int(total or 0)}")
    for idx, row in enumerate(rows, start=1):
        print(f"{idx}. technique={row.technique_label} outcome_metrics={row.outcome_metrics}")


if __name__ == "__main__":
    asyncio.run(verify())
