import requests
import re
from .schemas import IssueData


def _parse_repo_url(repo_url) -> tuple[str, str]:
    # Convert HttpUrl (Pydantic type) to raw string
    repo_url = str(repo_url)

    # Extract owner + repo
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url.rstrip("/"))
    if not match:
        raise ValueError("Invalid GitHub repo URL")
    return match.group(1), match.group(2)


def fetch_issue(repo_url, issue_number: int) -> IssueData:
    owner, repo = _parse_repo_url(repo_url)
    base = "https://api.github.com"

    issue_url = f"{base}/repos/{owner}/{repo}/issues/{issue_number}"
    comments_url = f"{issue_url}/comments"

    issue_resp = requests.get(issue_url)
    if issue_resp.status_code == 404:
        raise ValueError("Issue not found")
    issue_json = issue_resp.json()

    title = issue_json.get("title", "")
    body = issue_json.get("body", "")

    comments_resp = requests.get(comments_url)
    comments = [c.get("body", "") for c in comments_resp.json()] if comments_resp.ok else []

    return IssueData(title=title, body=body, comments=comments)
