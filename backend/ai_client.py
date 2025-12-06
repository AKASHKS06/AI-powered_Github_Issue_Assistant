import json
from google import generativeai as genai
from backend.config import get_settings


settings = get_settings()
genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-2.5-flash")


def analyze_issue_with_gemini(issue):
    body = issue.body if issue.body else ""
    comments = " | ".join(issue.comments[:3]) if issue.comments else "No comments"

    prompt = f"""
You are a senior software engineer analyzing GitHub issues.

STRICT JSON OUTPUT ONLY. Format MUST EXACTLY BE:

{{
  "summary": "A one-sentence summary.",
  "type": "bug | feature_request | documentation | question | other",
  "priority_score": "X - short justification. (X from 1 to 5)",
  "suggested_labels": ["2-3 labels only"],
  "potential_impact": "One short sentence."
}}

Rules:
- Summary must be 1 sentence max.
- Priority_score must include score + hyphen explanation. Example: "3 - affects build stability."
- Labels must be 2 or 3 items only
- You may reuse useful existing labels, but don't blindly copy all of them.
- Prefer concise labels that would help triage (e.g. "performance", "docs", "api", "testing").
- Share only JSON, no backticks, no markdown.

Input:
----
Title: {issue.title}
Body: {body}
Latest Comments: {comments}
----
"""

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Cleanup response (remove accidental markdown/backticks)
    raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    # Parse JSON safely
    try:
        data = json.loads(raw_text)
    except json.JSONDecodeError:
        # fallback: try to extract JSON substring
        start = raw_text.find("{")
        end = raw_text.rfind("}") + 1
        data = json.loads(raw_text[start:end])

    # Validate + post processing
    allowed_types = ["bug", "feature_request", "documentation", "question", "other"]
    if data.get("type") not in allowed_types:
        data["type"] = "other"

    # enforce max 3 labels and remove numbering
    labels = data.get("suggested_labels", [])
    cleaned_labels = []
    for label in labels:
        cleaned_labels.append(label.replace("0:", "").strip())
    data["suggested_labels"] = cleaned_labels[:3]

    # enforce one sentence fields
    if "summary" in data:
        data["summary"] = data["summary"].split(".")[0].strip() + "."
    if "potential_impact" in data:
        data["potential_impact"] = data["potential_impact"].split(".")[0].strip() + "."

    return data
