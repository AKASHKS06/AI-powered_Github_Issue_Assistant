import json
import google.generativeai as genai
from app.backend.config import get_settings
from app.backend.schemas import IssueData, AnalysisResult

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

MODEL_NAME = "gemini-2.5-flash"


def analyze_issue_with_gemini(issue: IssueData) -> AnalysisResult:
    prompt = f"""
Analyze this GitHub issue and return STRICT JSON only.

Issue Title:
{issue.title}

Issue Description:
{issue.body}

Issue Comments:
{" | ".join(issue.comments) if issue.comments else "None"}

JSON format:
{{
  "summary": "...",
  "type": "bug | feature_request | documentation | question | other",
  "priority_score": "1-5 with justification",
  "suggested_labels": ["...", "..."],
  "potential_impact": "..."
}}
"""

    model = genai.GenerativeModel(MODEL_NAME)

    response = model.generate_content(prompt)

    # Gemini can return structured parts → ensure we extract text
    try:
        content = response.text
    except:
        content = response.candidates[0].content.parts[0].text

    content = content.strip().strip("` ")

    # Sometimes models wrap JSON in ```json .... ```
    if content.startswith("```"):
        content = content.split("```")[1].strip()

    try:
        data = json.loads(content)
    except:
        start = content.find("{")
        end = content.rfind("}")
        data = json.loads(content[start:end + 1])

    return AnalysisResult(**data)
