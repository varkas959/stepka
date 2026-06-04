"""
Backend tests for AskTaaza LLM-backed endpoints (Gemini 2.5 Flash via emergentintegrations).
- GET  /api/
- POST /api/grade            (behavioral + technical)
- POST /api/analyze-jd
- Validation (422) and graceful error paths
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://crack-it-2.preview.emergentagent.com").rstrip("/")
TIMEOUT = 90  # Gemini calls can be slow


# ---------- shared fixtures ----------
@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- /api/ ----------
class TestRoot:
    def test_root_message(self, api):
        r = api.get(f"{BASE_URL}/api/", timeout=TIMEOUT)
        assert r.status_code == 200
        body = r.json()
        assert body == {"message": "AskTaaza API"}


# ---------- /api/grade ----------
class TestGrade:
    TECH_PAYLOAD = {
        "question": "Explain Kadane's algorithm",
        "answer": "Maintain running max-sum ending at index i; reset when prefix negative. O(n) time O(1) space.",
        "mode": "text",
        "is_behavioral": False,
    }

    BEHAV_PAYLOAD = {
        "question": "Tell me about a time you led a project under tight deadline.",
        "answer": "Situation: Q4 launch slipping by 3 weeks. Task: deliver MVP in 2 weeks. Action: trimmed scope to top 3 user flows, paired with two engineers, ran daily 10-min standups, removed CI bottleneck. Result: shipped on time, +18% conversion, exec-level recognition.",
        "mode": "text",
        "is_behavioral": True,
    }

    def _assert_common_shape(self, data):
        assert isinstance(data, dict), f"expected dict, got {type(data)}"
        for key in ("overall", "dims", "suggestedRating", "suggestedLabel", "text"):
            assert key in data, f"missing key {key} in response: {data}"

        # overall: number 1.0-5.0
        assert isinstance(data["overall"], (int, float))
        assert 1.0 <= float(data["overall"]) <= 5.0

        # dims: 4 items with name+score
        assert isinstance(data["dims"], list)
        assert len(data["dims"]) == 4, f"expected 4 dims, got {len(data['dims'])}"
        for d in data["dims"]:
            assert "name" in d and "score" in d
            assert isinstance(d["name"], str)
            assert isinstance(d["score"], (int, float))
            assert 0 <= d["score"] <= 100

        # suggestedRating ∈ {1,2,3,4}
        assert int(data["suggestedRating"]) in (1, 2, 3, 4)

        # suggestedLabel one of these strings
        assert data["suggestedLabel"] in ("Forgot", "Hard", "Good", "Easy")

        # text non-empty
        assert isinstance(data["text"], str) and len(data["text"]) > 10

    def test_grade_technical_returns_structured_dims(self, api):
        r = api.post(f"{BASE_URL}/api/grade", json=self.TECH_PAYLOAD, timeout=TIMEOUT)
        assert r.status_code == 200, f"got {r.status_code}: {r.text}"
        data = r.json()
        self._assert_common_shape(data)
        names = [d["name"] for d in data["dims"]]
        expected = {"Correctness", "Depth", "Examples", "Edge cases"}
        assert set(names) == expected, f"technical dim names mismatch: {names}"

    def test_grade_behavioral_returns_star_dims(self, api):
        r = api.post(f"{BASE_URL}/api/grade", json=self.BEHAV_PAYLOAD, timeout=TIMEOUT)
        assert r.status_code == 200, f"got {r.status_code}: {r.text}"
        data = r.json()
        self._assert_common_shape(data)
        names = [d["name"] for d in data["dims"]]
        expected = {"STAR structure", "Relevance", "Outcome clarity", "Conciseness"}
        assert set(names) == expected, f"behavioral dim names mismatch: {names}"

    def test_grade_invalid_body_returns_422(self, api):
        # Missing required fields question + answer
        r = api.post(f"{BASE_URL}/api/grade", json={"mode": "text"}, timeout=TIMEOUT)
        assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text}"


# ---------- /api/analyze-jd ----------
class TestAnalyzeJD:
    PAYLOAD = {
        "jd": "Senior SDE for Payments. Java, Kafka, AWS (EKS/Lambda/DynamoDB), microservices, distributed systems, event-driven architecture, observability, on-call ownership, mentoring juniors.",
        "target_company": "amazon",
        "target_role": "SDE2",
    }

    def test_analyze_jd_structure(self, api):
        r = api.post(f"{BASE_URL}/api/analyze-jd", json=self.PAYLOAD, timeout=TIMEOUT)
        assert r.status_code == 200, f"got {r.status_code}: {r.text}"
        data = r.json()

        for key in ("extractedSkills", "readiness", "suggestions"):
            assert key in data, f"missing key {key}: {data}"

        # readiness 0-100
        assert isinstance(data["readiness"], (int, float))
        assert 0 <= data["readiness"] <= 100

        # extractedSkills: list with at least 5 items containing name+mastery
        skills = data["extractedSkills"]
        assert isinstance(skills, list)
        assert len(skills) >= 5, f"expected >=5 skills, got {len(skills)}: {skills}"
        for s in skills:
            assert "name" in s and "mastery" in s
            assert isinstance(s["name"], str) and s["name"]
            assert isinstance(s["mastery"], (int, float))
            assert 0 <= s["mastery"] <= 100

        # suggestions: non-empty list of strings
        assert isinstance(data["suggestions"], list) and len(data["suggestions"]) >= 1
        for sug in data["suggestions"]:
            assert isinstance(sug, str) and len(sug) > 0

    def test_analyze_jd_invalid_body_returns_422(self, api):
        r = api.post(f"{BASE_URL}/api/analyze-jd", json={"jd": "only jd"}, timeout=TIMEOUT)
        assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text}"
