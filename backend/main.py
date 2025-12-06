from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.schemas import AnalyzeIssueRequest, AnalysisResult
from backend.github_client import fetch_issue, fetch_developer_info
from backend.ai_client import analyze_issue_with_gemini

app = FastAPI(title="AI GitHub Issue Assistant")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "OK"}


@app.post("/analyze_issue", response_model=AnalysisResult)
async def analyze_issue(req: AnalyzeIssueRequest):
    try:
        issue = fetch_issue(req.repo_url, req.issue_number)
        res = analyze_issue_with_gemini(issue)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/developer_info")
async def developer_info(req: AnalyzeIssueRequest):
    try:
        info = fetch_developer_info(req.repo_url, req.issue_number)
        return info
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
