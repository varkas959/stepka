from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import re
import uuid
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Status (existing) ----------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "AskTaaza API"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.model_dump())
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check.get('timestamp'), str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ---------- Gemini-powered endpoints ----------
class GradeRequest(BaseModel):
    question: str
    answer: str
    mode: str = 'text'         # 'text' | 'code'
    is_behavioral: bool = False
    topic: Optional[str] = None

class AnalyzeJDRequest(BaseModel):
    jd: str
    target_company: str
    target_role: str


def _extract_json(text: str) -> dict:
    """Pull the first JSON object from an LLM response, tolerating ```json fences."""
    text = text.strip()
    # Strip fenced blocks
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
    # Otherwise find first { ... } block
    if not text.startswith("{"):
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            text = m.group(0)
    return json.loads(text)


async def _gemini_json(system: str, user_text: str, session_tag: str) -> dict:
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="LLM key not configured")
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"{session_tag}-{uuid.uuid4()}",
        system_message=system,
    ).with_model("gemini", "gemini-2.5-flash")
    try:
        response = await chat.send_message(UserMessage(text=user_text))
        return _extract_json(response)
    except json.JSONDecodeError as e:
        logger.error(f"JSON decode failed: {e}; raw={response[:500] if 'response' in dir() else 'N/A'}")
        raise HTTPException(status_code=502, detail="Model returned invalid JSON")
    except Exception as e:
        logger.exception("Gemini call failed")
        raise HTTPException(status_code=502, detail=f"LLM error: {e}")


GRADE_SYSTEM = """You are a senior staff engineer grading interview answers at top tech companies.
Be honest, specific, and brief. Score generously when reasoning is solid; never inflate.
Always respond with STRICT JSON only, no prose outside the object."""

GRADE_USER_TEMPLATE_BEHAVIORAL = """Grade this behavioral interview answer.

QUESTION:
{question}

CANDIDATE ANSWER:
{answer}

Return ONLY this JSON shape (no markdown fences, no extra text):
{{
  "overall": <number 1.0-5.0, one decimal>,
  "dims": [
    {{"name": "STAR structure", "score": <0-100 int>}},
    {{"name": "Relevance", "score": <0-100 int>}},
    {{"name": "Outcome clarity", "score": <0-100 int>}},
    {{"name": "Conciseness", "score": <0-100 int>}}
  ],
  "suggestedRating": <1|2|3|4>,
  "suggestedLabel": "<Forgot|Hard|Good|Easy>",
  "text": "<2-3 short paragraphs of specific feedback, plain text>"
}}"""

GRADE_USER_TEMPLATE_TECHNICAL = """Grade this technical interview answer.

QUESTION:
{question}

CANDIDATE ANSWER ({mode}):
{answer}

Return ONLY this JSON shape (no markdown fences, no extra text):
{{
  "overall": <number 1.0-5.0, one decimal>,
  "dims": [
    {{"name": "Correctness", "score": <0-100 int>}},
    {{"name": "Depth", "score": <0-100 int>}},
    {{"name": "Examples", "score": <0-100 int>}},
    {{"name": "Edge cases", "score": <0-100 int>}}
  ],
  "suggestedRating": <1|2|3|4>,
  "suggestedLabel": "<Forgot|Hard|Good|Easy>",
  "text": "<2-3 short paragraphs of specific feedback, plain text>"
}}"""


@api_router.post("/grade")
async def grade_answer(req: GradeRequest):
    if req.is_behavioral:
        prompt = GRADE_USER_TEMPLATE_BEHAVIORAL.format(question=req.question, answer=req.answer)
    else:
        prompt = GRADE_USER_TEMPLATE_TECHNICAL.format(
            question=req.question, answer=req.answer, mode=req.mode
        )
    return await _gemini_json(GRADE_SYSTEM, prompt, "grade")


JD_SYSTEM = """You are an expert technical recruiter and interview coach.
Extract the most-relevant technical and behavioral skills from a job description,
estimate the candidate's plausible mastery (use the JD + role seniority as context;
err toward 40-70 range to leave room for growth), and produce an overall readiness score.
Respond with STRICT JSON only, no prose outside the object."""

JD_USER_TEMPLATE = """Analyze this JD for a candidate targeting {company} ({role}).

JOB DESCRIPTION:
{jd}

Return ONLY this JSON shape (no markdown, no extra text). Extract 6-10 skills.
{{
  "extractedSkills": [
    {{"name": "<skill name>", "mastery": <0-100 int>}}
  ],
  "readiness": <0-100 int overall readiness>,
  "suggestions": [
    "<one short specific suggestion>",
    "<another>"
  ]
}}"""


@api_router.post("/analyze-jd")
async def analyze_jd(req: AnalyzeJDRequest):
    prompt = JD_USER_TEMPLATE.format(jd=req.jd, company=req.target_company, role=req.target_role)
    return await _gemini_json(JD_SYSTEM, prompt, "jd")


# Wire up router + middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
