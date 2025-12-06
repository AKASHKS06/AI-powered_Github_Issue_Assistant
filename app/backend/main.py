from fastapi import FastAPI, HTTPException
from .schemas import AnalyzeIssueRequest, AnalysisResult
from app.backend.github_client import fetch_issue
from app.backend.ai_client import analyze_issue_with_gemini


app = FastAPI()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze_issue", response_model=AnalysisResult)
def analyze_issue(payload: AnalyzeIssueRequest):
    try:
        issue = fetch_issue(payload.repo_url, payload.issue_number)
        result = analyze_issue_with_gemini(issue)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
