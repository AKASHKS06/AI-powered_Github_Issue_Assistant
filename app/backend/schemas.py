from pydantic import BaseModel, HttpUrl


class AnalyzeIssueRequest(BaseModel):
    repo_url: HttpUrl
    issue_number: int


class IssueData(BaseModel):
    title: str
    body: str
    comments: list[str]


class AnalysisResult(BaseModel):
    summary: str
    type: str
    priority_score: str
    suggested_labels: list[str]
    potential_impact: str
