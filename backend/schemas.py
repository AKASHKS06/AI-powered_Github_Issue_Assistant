from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional


class AnalyzeIssueRequest(BaseModel):
    repo_url: HttpUrl
    issue_number: int


class IssueData(BaseModel):
    title: str
    body: str
    comments: List[str]


class AnalysisResult(BaseModel):
    summary: str
    type: str
    priority_score: str
    suggested_labels: List[str]
    potential_impact: str


# -------- Developer Info --------

class DeveloperMetadata(BaseModel):
    state: Optional[str] = None
    author: Optional[str] = None
    comments: Optional[int] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    html_url: Optional[str] = None
    repo_html_url: Optional[str] = None
    labels: List[str] = []


class DeveloperInfo(BaseModel):
    metadata: DeveloperMetadata
    detailed_json: Dict
