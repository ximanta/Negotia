# NEGOTIA — AI Program Counsellor Simulator

Real-time, Gemini-powered **enrollment counselling simulator** for program URLs.
This is no longer a price-negotiation demo; it evaluates counselling quality, objection handling, and enrollment commitment.

## What It Does

- Analyzes a program page URL and extracts structured program data.
- Generates a realistic prospective-student persona.
- Runs a streamed, turn-based counselling conversation over WebSocket.
- Tracks live counselling metrics (trust, tension, objections, enrollment probability).
- Produces structured judge analysis:
  - commitment signal
  - enrollment likelihood
  - unresolved objection
  - trust delta
- Supports retry mode with strategy improvement context.
- Exports a coaching PDF report.

---

## Architecture

### Backend (`backend/main.py`)

- `FastAPI` + `WebSocket`
- `google-genai` SDK (Gemini)
- Function-calling style structured extraction and judgement
- In-memory session and auth-token store

### Frontend (`frontend/src/App.jsx`)

- Single-page cinematic experience
- Stage flow: `idle → analyzing → negotiating → completed`
- Streaming transcript cards + live metric chips + retry run comparison

---

## Setup

## Prerequisites

- Python 3.10+ (3.11+ recommended)
- Node.js 16+
- Gemini API key

## Backend

```bash
cd backend
python3 -m pip install -r requirements.txt
```

Create `backend/.env` (example):

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_JUDGE_MODEL=gemini-2.5-flash
NEGOTIATION_MAX_ROUNDS=10
NEGOTIATION_MAX_ROUNDS_LIMIT=20
AUTH_TOKEN_TTL_SECONDS=86400
```

Run backend:

```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

> If `uvicorn` is “not found”, still use `python3 -m uvicorn ...` (recommended).

## Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

---

## Runtime Flow

1. User enters program URL.
2. Auth modal unlocks protected operations.
3. `POST /analyze-url` extracts program + persona and creates `session_id`.
4. Frontend opens `ws://localhost:8000/negotiate` with `session_id`.
5. Backend streams dialogue chunks and emits live metric updates.
6. Judge returns structured outcome at end.
7. Optional retry reuses same `session_id` with improved strategy context.
8. `POST /generate-report` returns downloadable PDF.

---

## API Surface

- `POST /auth/login`
  - body: `{ "password": "..." }`
  - returns auth token + TTL

- `POST /analyze-url`
  - body: `{ "url": "...", "auth_token": "..." }`
  - returns `{ session_id, program, persona, source }`

- `WS /negotiate`
  - init payload: `{ session_id, auth_token, demo_mode, retry_mode }`
  - emits: `session_ready`, `stream_chunk`, `message_complete`, `state_update`, `metrics_update`, `analysis`, `error`

- `POST /generate-report`
  - body: `{ session_id, auth_token, transcript, analysis }`
  - returns PDF stream

---

## Key Model Outputs

### Program extraction

- program_name, value_proposition, key_features
- duration, format, weekly_time_commitment
- program_fee_inr, placement_support_details, certification_details
- curriculum_modules, learning_outcomes
- cohort_start_dates, faqs, projects_use_cases
- program_curriculum_coverage, tools/frameworks, EMI/financing options

### Judge output

- winner, why
- commitment_signal (`none|soft_commitment|conditional_commitment|strong_commitment`)
- enrollment_likelihood (0–100)
- primary_unresolved_objection
- trust_delta
- strengths, mistakes, pivotal_moments, negotiation_score, skill_recommendations

---

## Troubleshooting

- **Frontend not reflecting edits (WSL + `/mnt/...`)**
  - use polling-based `npm start` (already configured in `frontend/package.json`)
  - hard refresh once if needed

- **Auth/session expired**
  - token TTL is controlled by `AUTH_TOKEN_TTL_SECONDS`
  - restart backend clears in-memory tokens/sessions

- **`uvicorn` not found**
  - run with `python3 -m uvicorn ...`

- **Gemini blocked/empty structured output**
  - fallback handlers are used; check backend logs for warnings

---

## Current Positioning

This project is an **AI Enrollment Counselling Intelligence Simulator**:

- objective is student commitment quality, not pure price convergence
- retry demonstrates strategy adaptation
- final output supports coaching and operational review

