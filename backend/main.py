"""
AttendanceSafe backend — calculates how many classes a student can bunk
while staying at or above a target attendance percentage (default 75%).

Two entry points:
  POST /calculate-manual  -> user types in numbers
  POST /calculate-ai      -> user uploads a screenshot; Groq's vision model
                             reads the numbers off it, then we run the SAME
                             math as the manual path.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
"""

import os
import math
import base64
import json
import asyncio
import re
from typing import Optional

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq, RateLimitError, APIStatusError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from pathlib import Path

# Load .env file reliably from the backend directory
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
# Groq deprecates/rotates vision models fairly often — keep this in env,
# not hardcoded. Check console.groq.com/docs/models for the current
# active multimodal model if this one stops working.
GROQ_VISION_MODEL = os.environ.get("GROQ_VISION_MODEL", "qwen/qwen3.6-27b")
TARGET_PERCENTAGE = float(os.environ.get("TARGET_PERCENTAGE", 75))

# --- Load protection settings (tune these against your real Groq tier limits) ---
# Per-student limit: stops one person from hammering the AI endpoint.
AI_RATE_LIMIT = os.environ.get("AI_RATE_LIMIT", "6/minute")
# Global concurrency limit: caps how many Groq calls are in-flight at once,
# regardless of how many students hit the endpoint simultaneously. This is
# what actually protects you from a 500-student instant spike — excess
# requests wait briefly instead of all slamming Groq at the same moment.
MAX_CONCURRENT_AI_CALLS = int(os.environ.get("MAX_CONCURRENT_AI_CALLS", "10"))

groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
ai_call_semaphore = asyncio.Semaphore(MAX_CONCURRENT_AI_CALLS)

def get_groq_client() -> Optional[Groq]:
    global groq_client
    if groq_client is None:
        key = os.environ.get("GROQ_API_KEY")
        if key:
            groq_client = Groq(api_key=key)
    return groq_client

if not GROQ_API_KEY:
    print("WARNING: GROQ_API_KEY is not set. /calculate-ai will not work until it is.")

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="AttendanceSafe API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# In production, replace "*" with your actual deployed frontend origin.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Request / response models ----------

class ManualRequest(BaseModel):
    total: int = Field(..., ge=0, description="Total classes held so far")
    attended: int = Field(..., ge=0, description="Classes attended so far")
    remaining: Optional[int] = Field(
        None, ge=0, description="Classes still remaining this semester, if known"
    )


class CalculationResult(BaseModel):
    current_percentage: float
    target_percentage: float
    max_bunks: int
    classes_needed: Optional[int] = None
    message: str


# ---------- Core math (shared by both endpoints) ----------

def calculate_result(total: int, attended: int, remaining: Optional[int]) -> CalculationResult:
    if total == 0:
        raise HTTPException(
            status_code=422,
            detail="Total classes held can't be zero — there's nothing to calculate yet.",
        )
    if attended > total:
        raise HTTPException(
            status_code=422,
            detail="Attended classes can't be more than total classes held.",
        )

    target = TARGET_PERCENTAGE / 100.0
    current_percentage = round((attended / total) * 100, 2)

    # Case B: we know how many classes are still coming up this semester.
    if remaining:
        x = attended + remaining - target * (total + remaining)
        if x >= 0:
            max_bunks = math.floor(x)
            message = (
                f"You're on track. You can skip up to {max_bunks} of your "
                f"remaining {remaining} classes and still finish at "
                f"{TARGET_PERCENTAGE:.0f}% attendance."
            )
            return CalculationResult(
                current_percentage=current_percentage,
                target_percentage=TARGET_PERCENTAGE,
                max_bunks=max_bunks,
                classes_needed=None,
                message=message,
            )
        else:
            # Even attending every remaining class won't be enough on its own —
            # this branch just reports where they stand; it's already the best case.
            classes_needed = 0
            message = (
                f"Even attending all {remaining} remaining classes will keep you "
                f"below {TARGET_PERCENTAGE:.0f}%. Attend every remaining class to "
                f"minimize the shortfall."
            )
            return CalculationResult(
                current_percentage=current_percentage,
                target_percentage=TARGET_PERCENTAGE,
                max_bunks=0,
                classes_needed=classes_needed,
                message=message,
            )

    # Case A: no "remaining" count given — just check current standing.
    max_bunks_raw = math.floor(attended / target) - total
    if max_bunks_raw >= 0:
        message = (
            f"You're currently at {current_percentage}%. Based on classes held so far, "
            f"you had room to miss {max_bunks_raw} more (already-held) classes and "
            f"still be at {TARGET_PERCENTAGE:.0f}%."
        )
        return CalculationResult(
            current_percentage=current_percentage,
            target_percentage=TARGET_PERCENTAGE,
            max_bunks=max_bunks_raw,
            classes_needed=None,
            message=message,
        )
    else:
        # Below target — tell them how many *consecutive attended* classes
        # (assuming total keeps growing by 1 each time) would bring them back up.
        # Solve for smallest n where (attended + n) / (total + n) >= target
        n = 0
        attended_f, total_f = attended, total
        while (attended_f + n) / (total_f + n) < target and n < 100000:
            n += 1
        message = (
            f"You're currently at {current_percentage}%, below the "
            f"{TARGET_PERCENTAGE:.0f}% target. Attend the next {n} classes "
            f"in a row (with no more misses) to get back to target."
        )
        return CalculationResult(
            current_percentage=current_percentage,
            target_percentage=TARGET_PERCENTAGE,
            max_bunks=0,
            classes_needed=n,
            message=message,
        )


# ---------- Endpoints ----------

@app.post("/calculate-manual", response_model=CalculationResult)
def calculate_manual(payload: ManualRequest):
    return calculate_result(payload.total, payload.attended, payload.remaining)


@app.post("/calculate-ai", response_model=CalculationResult)
@limiter.limit(AI_RATE_LIMIT)
async def calculate_ai(request: Request, file: UploadFile = File(...)):
    active_client = get_groq_client()
    if not active_client:
        raise HTTPException(
            status_code=500,
            detail="Server is missing GROQ_API_KEY — AI mode is not configured.",
        )

    if file.content_type not in ("image/jpeg", "image/png", "image/jpg", "image/webp"):
        raise HTTPException(
            status_code=422,
            detail="Please upload a JPEG, PNG, or WEBP screenshot.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > 20 * 1024 * 1024:
        raise HTTPException(status_code=422, detail="Image is too large (max 20MB).")

    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    data_url = f"data:{file.content_type};base64,{b64_image}"

    system_instruction = (
        "You are an OCR assistant. Look at this attendance portal screenshot and "
        "extract ONLY: total_classes_held and classes_attended as numbers. If "
        "multiple subjects are shown, sum their totals and attended counts across "
        "all subjects. Respond with STRICT JSON only, no explanation, no markdown "
        "formatting, no code fences, in exactly this shape: "
        '{"total_classes": <int>, "attended_classes": <int>}'
    )

    # The semaphore caps how many Groq calls run at once, no matter how many
    # requests land in the same instant. Extra requests simply wait their turn
    # for a short moment instead of all hitting Groq's rate limit together.
    try:
        async with ai_call_semaphore:
            completion = await asyncio.to_thread(
                active_client.chat.completions.create,
                model=GROQ_VISION_MODEL,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": system_instruction},
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    }
                ],
                temperature=0,
            )
        raw_text = completion.choices[0].message.content.strip()
    except RateLimitError:
        # This is Groq telling us we've hit its requests/tokens-per-minute cap —
        # almost certainly what happens during a big simultaneous spike.
        raise HTTPException(
            status_code=429,
            detail=(
                "A lot of students are using this right now. Please try again "
                "in about 30 seconds, or use manual entry instead."
            ),
        )
    except APIStatusError as e:
        raise HTTPException(
            status_code=502,
            detail=f"The AI service returned an error. Try again shortly. ({e.status_code})",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Couldn't reach the AI model right now. Try again shortly. ({e})",
        )

    # Be defensive: strip reasoning tokens (<think>...</think>) and accidental code fences.
    cleaned = re.sub(r"<think>.*?</think>", "", raw_text, flags=re.DOTALL).strip()
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    # Extract JSON object substring if model wrapped it with additional text
    json_match = re.search(r"\{[\s\S]*?\}", cleaned)
    json_str = json_match.group(0) if json_match else cleaned

    try:
        parsed = json.loads(json_str)
        total_classes = int(parsed["total_classes"])
        attended_classes = int(parsed["attended_classes"])
    except (json.JSONDecodeError, KeyError, ValueError, TypeError):
        raise HTTPException(
            status_code=422,
            detail=(
                "Could not read the attendance data clearly from that screenshot. "
                "Try a clearer image, or enter your numbers manually."
            ),
        )

    return calculate_result(total_classes, attended_classes, None)


dist_dir = Path(__file__).resolve().parent.parent / "frontend" / "dist"
if (dist_dir / "assets").exists():
    app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

@app.get("/")
def health_check(request: Request):
    dist_index = dist_dir / "index.html"
    if dist_index.exists() and "text/html" in request.headers.get("accept", ""):
        return FileResponse(dist_index)
    return {"status": "ok", "service": "AttendanceSafe API"}

@app.get("/health")
def api_health():
    return {"status": "ok", "service": "AttendanceSafe API"}
