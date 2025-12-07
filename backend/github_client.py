import requests
import re
from schemas import IssueData
from config import get_settings

settings = get_settings()


def _parse_repo_url(repo_url) -> tuple[str, str]:
    repo_url = str(repo_url)
    match = re.match(r"https?://github\.com/([^/]+)/([^/]+)", repo_url.rstrip("/"))
    if not match:
        raise ValueError("Invalid GitHub repo URL")
    return match.group(1), match.group(2)


def _github_headers():
    headers = {"Accept": "application/vnd.github+json"}
    if getattr(settings, "GITHUB_TOKEN", None):
        headers["Authorization"] = f"Bearer {settings.GITHUB_TOKEN}"
    return headers


def _filter_comments(comments: list[str]) -> list[str]:
    filtered = []

    for c in comments:
        if not c or not c.strip():
            continue  # empty

        stripped = c.strip()

        # Skip pure emoji / +1 spam / short meaningless messages
        if stripped in ["+1", "👍", "👍🏻", "upvote", "same here"]:
            continue
        if len(stripped) <= 4 and all(ch in "+1!?" for ch in stripped):
            continue

        # Skip comments with no actual alphabet characters
        if not re.search(r"[A-Za-z]", stripped):
            continue

        filtered.append(stripped)

    return filtered[:5]  # still cap to avoid long API input


def fetch_issue(repo_url, issue_number: int) -> IssueData:
    try:
        owner, repo = _parse_repo_url(repo_url)
        base = "https://api.github.com"
        issue_url = f"{base}/repos/{owner}/{repo}/issues/{issue_number}"
        comments_url = f"{issue_url}/comments"

        issue_resp = requests.get(issue_url, headers=_github_headers(), timeout=10)

        if issue_resp.status_code == 403:
            raise ValueError("GitHub rate limit exceeded. Add or update your GitHub API token.")
        if issue_resp.status_code == 404:
            raise ValueError("Issue not found")

        issue_json = issue_resp.json()

        comments_resp = requests.get(comments_url, headers=_github_headers(), timeout=10)
        raw_comments = [c.get("body", "") for c in comments_resp.json()] if comments_resp.ok else []
        comments = _filter_comments(raw_comments)

        return IssueData(
            title=issue_json.get("title", "No title"),
            body=issue_json.get("body", "No description provided"),
            comments=comments
        )

    except requests.exceptions.Timeout:
        raise ValueError("GitHub request timed out. Please retry.")
    except requests.exceptions.RequestException:
        raise ValueError("Failed to reach GitHub API. Check your connection or token.")


def fetch_developer_info(repo_url, issue_number: int) -> dict:
    try:
        owner, repo = _parse_repo_url(repo_url)
        base = "https://api.github.com"
        issue_url = f"{base}/repos/{owner}/{repo}/issues/{issue_number}"
        comments_url = f"{issue_url}/comments"

        issue_resp = requests.get(issue_url, headers=_github_headers(), timeout=10)

        if issue_resp.status_code == 403:
            raise ValueError("GitHub rate limit exceeded. Add or update your GitHub API token.")
        if issue_resp.status_code == 404:
            raise ValueError("Issue not found")

        issue_json = issue_resp.json()

        comments_resp = requests.get(comments_url, headers=_github_headers(), timeout=10)
        raw_comments = [c.get("body", "") for c in comments_resp.json()] if comments_resp.ok else []
        comments = _filter_comments(raw_comments)

        labels = [l.get("name", "") for l in issue_json.get("labels", [])]

        metadata = {
            "state": issue_json.get("state", ""),
            "author": issue_json.get("user", {}).get("login", ""),
            "comments": issue_json.get("comments", 0),
            "created_at": issue_json.get("created_at", ""),
            "updated_at": issue_json.get("updated_at", ""),
            "html_url": issue_json.get("html_url", ""),
            "repo_html_url": f"https://github.com/{owner}/{repo}",
            "labels": labels,
        }

        detailed_json = {
            "repo": f"{owner}/{repo}",
            "issue_number": issue_number,
            "title": issue_json.get("title", ""),
            "body": issue_json.get("body", ""),
            "state": issue_json.get("state", ""),
            "labels": labels,
            "author": metadata["author"],
            "created_at": issue_json.get("created_at", ""),
            "updated_at": issue_json.get("updated_at", ""),
            "comments_count": issue_json.get("comments", 0),
            "comments": comments,
            "html_url": issue_json.get("html_url", ""),
            "api_url": issue_url,
        }

        return {"metadata": metadata, "detailed_json": detailed_json}

    except requests.exceptions.Timeout:
        raise ValueError("GitHub request timed out. Please retry.")
    except requests.exceptions.RequestException:
        raise ValueError("Failed to reach GitHub API. Check your connection or token.")
