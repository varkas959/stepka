from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import json
import logging
import re
import uuid
from pathlib import Path
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

_CONTROL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
MAX_TEXT_LEN = 8000
MAX_SHORT_LEN = 120

def _sanitize(text: str, max_len: int = MAX_TEXT_LEN) -> str:
    if text is None:
        return ""
    s = _CONTROL_RE.sub("", str(text)).strip()
    if len(s) > max_len:
        s = s[:max_len]
    return s


app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@api_router.get("/")
async def root():
    return {"message": "AskTaaza API"}


# ---------- Gemini-powered endpoints ----------
class GradeRequest(BaseModel):
    question: str
    answer: str
    mode: str = 'text'
    is_behavioral: bool = False
    topic: Optional[str] = None

class AnalyzeJDRequest(BaseModel):
    jd: str
    target_company: str
    target_role: str

class ExtractSkillsRequest(BaseModel):
    jd: str
    target_company: str
    target_role: str

class ModerationRequest(BaseModel):
    text: str


def _extract_json(text: str) -> dict:
    text = text.strip()
    fence = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if fence:
        text = fence.group(1)
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
    q = _sanitize(req.question)
    a = _sanitize(req.answer)
    if req.is_behavioral:
        prompt = GRADE_USER_TEMPLATE_BEHAVIORAL.format(question=q, answer=a)
    else:
        prompt = GRADE_USER_TEMPLATE_TECHNICAL.format(question=q, answer=a, mode=req.mode)
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
    prompt = JD_USER_TEMPLATE.format(
        jd=_sanitize(req.jd),
        company=_sanitize(req.target_company, MAX_SHORT_LEN),
        role=_sanitize(req.target_role, MAX_SHORT_LEN),
    )
    return await _gemini_json(JD_SYSTEM, prompt, "jd")


EXTRACT_SYSTEM = """You are an expert technical recruiter.
Extract the most-relevant technical and behavioral skills from a job description and
assign each an importance weight from 1 (nice-to-have) to 5 (must-have, central to the role).
Respond with STRICT JSON only, no prose outside the object."""

EXTRACT_USER_TEMPLATE = """Extract skills from this JD for a candidate targeting {company} ({role}).

JOB DESCRIPTION:
{jd}

Return ONLY this JSON shape (no markdown, no extra text). Extract 6-10 skills.
{{
  "skills": [
    {{"name": "<concise skill name, 1-3 words>", "weight": <1-5 int importance>}}
  ]
}}"""


@api_router.post("/extract-skills")
async def extract_skills(req: ExtractSkillsRequest):
    prompt = EXTRACT_USER_TEMPLATE.format(
        jd=_sanitize(req.jd),
        company=_sanitize(req.target_company, MAX_SHORT_LEN),
        role=_sanitize(req.target_role, MAX_SHORT_LEN),
    )
    return await _gemini_json(EXTRACT_SYSTEM, prompt, "extract")


PROFANITY_WORDS = {
    "fuck", "shit", "bitch", "asshole", "bastard", "cunt", "dick", "pussy",
    "porn", "xxx", "nsfw", "nude", "naked", "sex", "erotic", "escort",
    "rape", "kill yourself", "kys", "retard",
}
URL_RE = re.compile(r"\bhttps?://\S+|\bwww\.\S+", re.IGNORECASE)
ADULT_DOMAINS = {"pornhub", "xvideos", "xhamster", "redtube", "onlyfans", "chaturbate", "youporn"}


def _moderate_text(text: str):
    lower = text.lower()
    flagged = []
    for word in PROFANITY_WORDS:
        if word in lower:
            flagged.append({"kind": "profanity", "match": word})
    urls = URL_RE.findall(text)
    if urls:
        flagged.append({"kind": "url", "match": ", ".join(urls[:3])})
        for d in ADULT_DOMAINS:
            if any(d in u.lower() for u in urls):
                flagged.append({"kind": "adult_domain", "match": d})
                break
    return {"ok": len(flagged) == 0, "flagged": flagged}


@api_router.post("/moderate")
async def moderate(req: ModerationRequest):
    return _moderate_text(_sanitize(req.text))


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
