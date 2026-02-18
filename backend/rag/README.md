# RAG Ingestion Pipeline (Phase 1)

This pipeline builds institutional memory from completed sessions.
It runs **after** sessions complete and does **not** modify the live websocket loop.

## What It Does

1. Reads traceability JSON (`conversation_traceability.json` or `human_vs_ai_conversation_traceability.json`)
2. Identifies winning triads:
   - `Student (objection)` -> `Counsellor (response)` -> `Student (reaction)`
   - Keeps triads where `trust_delta >= 5` OR `skepticism_delta <= -5`
3. Normalizes triads using Gemini (trigger/response/technique)
4. Generates embeddings using Azure OpenAI via `litellm`
5. Stores nuggets in Postgres (`pgvector`)

## Files

- `database.py`: SQLAlchemy async engine + `KnowledgeNugget` model
- `migrations/001_create_knowledge_nuggets.sql`: extension + table DDL
- `harvester.py`: triad detection + Gemini normalization
- `ingest.py`: end-to-end ingestion runner
- `verify_ingestion.py`: row count + technique/outcome inspection
- `query_test.py`: vector similarity lookup test

## Environment

Set these in `backend/.env`:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `DATABASE_URL=postgresql+asyncpg://postgres:postgres_password@localhost:5455/closewire_db`
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small`
- `AZURE_OPENAI_API_VERSION=2024-02-01`

## Install

Run from project root (WSL):

```bash
pip install -r backend/requirements.txt
```

## Ingest

Run migration + ingest:

```bash
python -m backend.rag.ingest --file outputs/tracebility/runtime/ai_vs_ai/conversation_traceability.json --migrate
```

Or ingest an existing human-mode trace:

```bash
python -m backend.rag.ingest --file outputs/tracebility/runtime/human_vs_ai/conversation_traceability.json
```

Expected output:

```text
Ingestion complete. knowledge_nuggets inserted: <N>
```

## Verify Rows

```bash
python -m backend.rag.verify_ingestion
```

Expected:

```text
knowledge_nuggets count: <N>
1. technique=<...> outcome_metrics={<...>}
```

## Vector Search Test

```bash
python -m backend.rag.query_test --text "The fees are too high." --top-k 3
```

Expected:

```text
Top 3 matches for: The fees are too high.
1. distance=...
   trigger: ...
   response: ...
```

## Notes

- Embeddings use **Azure OpenAI via `litellm`**.
- LLM normalization uses **Gemini**.
- This is Phase 1 ingestion only; runtime retrieval is Phase 2.
- Runtime traces are written to `outputs/tracebility/runtime/<pipeline>/`.
- Post-session RAG human-readable logs are written to `outputs/tracebility/rag/<pipeline>/`.
