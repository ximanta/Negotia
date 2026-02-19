# CloseWire Global Brain: The Harvester & Knowledge Nuggets

This pipeline builds **Institutional Memory** by harvesting "winning triads" from completed sessions. It is the engine behind the **Data Flywheel**, ensuring that every successful interaction makes the entire system smarter.

## What It Does

1. **The Harvester**: Analyzes session traces to identify high-impact moments.
   - `Student (objection)` -> `Counsellor (response)` -> `Student (reaction)`
   - Filters for triads with significant positive shifts in trust or sentiment.
2. **Knowledge Nugget Extraction**: Normalizes these interactions using Gemini into discrete, reusable "Nuggets."
3. **Vectorization**: Generates embeddings (via Azure OpenAI/litellm) for semantic retrieval.
4. **Memory Storage**: Stores nuggets in Postgres (`pgvector`) for the **Arena/Copilot** pipeline.

## Files

- `harvester.py`: The core logic for triad detection and normalization.
- `database.py`: SQLAlchemy models for `KnowledgeNugget`.
- `ingest.py`: End-to-end runner for the ingestion flywheel.
- `verify_ingestion.py`: Inspector for harvested data quality.
- `query_test.py`: Simulator for "Arena" retrieval.

## Environment

Set these in `backend/.env`:
- `RAG_PIPELINE_ENABLED=true`
- `DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/closewire_db`
- `GEMINI_API_KEY`
- `AZURE_OPENAI_EMBEDDING_DEPLOYMENT` (for vectorization)

## Operation

### Ingesting New Sessions
```bash
python -m backend.rag.ingest --file backend/outputs/tracebility/runtime/ai_vs_ai/conversation_traceability.json
```

### Verifying the Brain
```bash
python -m backend.rag.verify_ingestion
```

## The Flywheel Result
When the **Arena** pipeline is active, it queries this "Global Brain" in real-time. If a student presents an objection, the system retrieves a similar **Knowledge Nugget** and "whispers" the winning response to the counsellor.
