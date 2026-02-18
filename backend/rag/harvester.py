import json
import os
import re
from dataclasses import dataclass
from typing import Any, Dict, List

from dotenv import load_dotenv
from google import genai

load_dotenv()


@dataclass
class WinningTriad:
    trigger_message: Dict[str, Any]
    counsellor_message: Dict[str, Any]
    reaction_message: Dict[str, Any]
    trust_delta: int
    skepticism_delta: int


def _safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(float(value))
    except Exception:
        return default


def identify_winning_triads(messages: List[Dict[str, Any]]) -> List[WinningTriad]:
    triads: List[WinningTriad] = []
    if len(messages) < 3:
        return triads

    for i in range(0, len(messages) - 2):
        msg_i = messages[i] or {}
        msg_j = messages[i + 1] or {}
        msg_k = messages[i + 2] or {}
        if str(msg_i.get("agent", "")).lower() != "student":
            continue
        if str(msg_j.get("agent", "")).lower() != "counsellor":
            continue
        if str(msg_k.get("agent", "")).lower() != "student":
            continue

        pre = msg_i.get("updated_stats") or {}
        post = msg_k.get("updated_stats") or {}
        trust_pre = _safe_int(pre.get("trust_score"), 0)
        trust_post = _safe_int(post.get("trust_score"), trust_pre)
        skepticism_pre = _safe_int(pre.get("skepticism_level"), 0)
        skepticism_post = _safe_int(post.get("skepticism_level"), skepticism_pre)

        trust_delta = trust_post - trust_pre
        skepticism_delta = skepticism_post - skepticism_pre
        if trust_delta >= 5 or skepticism_delta <= -5:
            triads.append(
                WinningTriad(
                    trigger_message=msg_i,
                    counsellor_message=msg_j,
                    reaction_message=msg_k,
                    trust_delta=trust_delta,
                    skepticism_delta=skepticism_delta,
                )
            )
    return triads


def _parse_json_object(text: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    payload = (text or "").strip()
    if not payload:
        return fallback
    try:
        return json.loads(payload)
    except Exception:
        pass

    fenced = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", payload, flags=re.IGNORECASE)
    if fenced:
        try:
            return json.loads(fenced.group(1))
        except Exception:
            pass

    start = payload.find("{")
    end = payload.rfind("}")
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(payload[start : end + 1])
        except Exception:
            pass
    return fallback


def normalize_triad(client: genai.Client, model_name: str, triad: WinningTriad) -> Dict[str, str]:
    fallback = {
        "trigger": str(triad.trigger_message.get("content", "")).strip()[:320],
        "response": str(triad.counsellor_message.get("content", "")).strip()[:320],
        "technique": "Objection Handling",
    }
    prompt = f"""
INPUT TRIAD:
Student: "{triad.trigger_message.get('content', '')}"
Counsellor: "{triad.counsellor_message.get('content', '')}"
Student Reaction: (Trust increased by {triad.trust_delta}, Skepticism changed by {triad.skepticism_delta})

TASK:
1. Summarize the Student's core objection (Trigger).
2. Summarize the Counsellor's specific winning argument (Response).
3. Identify the sales technique used.

Tone rule:
- Keep output concise and concrete.

OUTPUT JSON:
{{
  "trigger": "Concerns about AI making Java obsolete",
  "response": "Java is the backbone of enterprise AI; you need to be the pilot.",
  "technique": "Reframing"
}}
"""
    response = client.models.generate_content(
        model=model_name,
        contents=prompt,
    )
    raw = str(getattr(response, "text", "") or "").strip()
    parsed = _parse_json_object(raw, fallback)
    return {
        "trigger": str(parsed.get("trigger", fallback["trigger"])).strip(),
        "response": str(parsed.get("response", fallback["response"])).strip(),
        "technique": str(parsed.get("technique", fallback["technique"])).strip(),
    }


def get_gemini_client_and_model() -> tuple[genai.Client, str]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY in environment.")
    model_name = (
        os.getenv("GEMINI_MODEL", "").strip()
        or os.getenv("GEMINI_MODE", "").strip()
        or "gemini-2.5-flash"
    )
    return genai.Client(api_key=api_key), model_name
