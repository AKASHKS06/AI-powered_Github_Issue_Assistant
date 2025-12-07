import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

const API_BASE = "http://localhost:8000";
const ANALYZE_API = `${API_BASE}/analyze_issue`;
const DEV_API = `${API_BASE}/developer_info`;

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [issueNumber, setIssueNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [showDev, setShowDev] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [devError, setDevError] = useState("");
  const [devInfo, setDevInfo] = useState(null);

  const [cacheCount, setCacheCount] = useState(0);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("analysisCache") || "[]");
      if (Array.isArray(stored)) {
        setCacheCount(stored.length);
        setRecent(stored.slice(0, 5));
      }
    } catch {}
  }, []);

  const saveToCache = (data) => {
    if (!data) return;
    let stored = JSON.parse(localStorage.getItem("analysisCache") || "[]");
    if (!Array.isArray(stored)) stored = [];

    const clean = {
      repo: data.repo || repoUrl,
      issue_number: data.issue_number || issueNumber,
    };

    stored.unshift(clean);
    localStorage.setItem("analysisCache", JSON.stringify(stored));
    setCacheCount(stored.length);
    setRecent(stored.slice(0, 5));
  };

  const handleAnalyze = async () => {
    setError("");
    setShowDev(false);
    setDevInfo(null);
    setDevError("");
    setResult(null);

    if (!repoUrl.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(ANALYZE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: repoUrl,
          issue_number: Number(issueNumber),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Something went wrong.");
      } else {
        data.repo = repoUrl;
        data.issue_number = issueNumber;
        setResult(data);
        saveToCache(data);
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDeveloperOptions = async () => {
    if (showDev) {
      setShowDev(false);
      return;
    }

    setDevError("");
    setDevLoading(true);

    try {
      const response = await fetch(DEV_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_url: repoUrl,
          issue_number: Number(issueNumber),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDevError(data.detail || "Failed to load developer info.");
      } else {
        setDevInfo(data);
        setShowDev(true);
      }
    } catch (err) {
      console.error(err);
      setDevError("Could not fetch developer info.");
    } finally {
      setDevLoading(false);
    }
  };

  const copyJSON = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    alert("Copied JSON to clipboard! 📋");
  };

  const saveManually = () => {
    if (!result) return;
    saveToCache(result);
    alert("Analysis saved locally! 💾");
  };

  const copyDevJSON = () => {
    if (!devInfo) return;
    navigator.clipboard.writeText(JSON.stringify(devInfo.detailed_json, null, 2));
    alert("Copied detailed JSON to clipboard! 📋");
  };

  const handleClearCache = () => {
    localStorage.removeItem("analysisCache");
    setCacheCount(0);
    setRecent([]);
    alert("✔ Cache cleared!");
  };

  return (
    <div className="app">
      <section className="intro">
        <h1> Seedling Labs — AI GitHub Issue Assistant</h1>
      </section>

      {/* Analyze Form */}
      <section className="card">
        <h2>Analyze an Issue</h2>

        <label className="field">
          <span>GitHub Repo URL</span>
          <input
            type="text"
            placeholder="Enter repo link"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Issue Number</span>
          <input
            type="number"
            min="1"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
          />
        </label>

        <button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Issue"}
        </button>
      </section>

      {!loading && result && !error && (
        <>
          <div className="status success">✔ Analysis complete</div>
          <button className="dev-btn" onClick={handleDeveloperOptions}>
            {showDev ? "Hide Developer Info" : "Developer Options"}
          </button>
        </>
      )}

      {error && <div className="status error">{error}</div>}
      {devError && <div className="status error">{devError}</div>}

      {/* Skeleton Loader */}
      {loading && (
        <section className="card fade-in">
          <h2>⏳ Preparing Analysis...</h2>
          <div className="skeleton text-line" style={{ width: "90%" }}></div>
          <div className="skeleton text-line" style={{ width: "70%" }}></div>
          <div className="skeleton text-line" style={{ width: "50%" }}></div>
          <div
            className="skeleton box-block"
            style={{ height: "70px", marginTop: "18px" }}
          ></div>
        </section>
      )}

      {!loading && result && (
        <section className="card fade-in">
          <h2>Analysis Result</h2>

          <div className="row">
            <h3>Summary</h3>
            <p>{result.summary}</p>
          </div>

          <div className="row">
            <h3>Type</h3>
            <span className="pill">{result.type}</span>
          </div>

          <div className="row">
            <h3>Priority</h3>
            <p>{result.priority_score}</p>
          </div>

          <div className="row">
            <h3>Suggested Labels</h3>
            <div className="pill-row">
              {Array.isArray(result.suggested_labels) &&
                result.suggested_labels.map((label, idx) => (
                  <span key={idx} className="pill pill-secondary">
                    {label}
                  </span>
                ))}
            </div>
          </div>

          <div className="row">
            <h3>Potential Impact</h3>
            <p>{result.potential_impact}</p>
          </div>

          <div className="row">
            <h3>Raw JSON Output</h3>
            <pre className="json-block fade-in">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          <div className="result-buttons">
            <button onClick={copyJSON}>📋 Copy JSON</button>
            <button onClick={saveManually} style={{ background: "#10B981" }}>
              💾 Save JSON
            </button>
          </div>
        </section>
      )}

      {!loading && showDev && devInfo && (
        <section className="card dev-card fade-in">
          <h2>🧑‍💻 Developer Info</h2>

          <div className="row">
            <h3>GitHub Metadata</h3>
            <p><strong>State:</strong> {devInfo.metadata.state}</p>
            <p><strong>Author:</strong> {devInfo.metadata.author}</p>
            <p><strong>Comments:</strong> {devInfo.metadata.comments}</p>
            <p><strong>Created:</strong> {devInfo.metadata.created_at}</p>
            <p><strong>Updated:</strong> {devInfo.metadata.updated_at}</p>
            {devInfo.metadata.labels && devInfo.metadata.labels.length > 0 && (
              <p><strong>Labels:</strong> {devInfo.metadata.labels.join(", ")}</p>
            )}
          </div>

          {/* Quick Links STILL HERE */}
          <div className="row dev-links">
            <h3>🔗 Quick Links</h3>
            {devInfo.metadata.html_url && (
              <a href={devInfo.metadata.html_url} target="_blank" rel="noreferrer">
                🧩 Open Issue
              </a>
            )}
            {devInfo.metadata.repo_html_url && (
              <>
                <div>
                  <a href={devInfo.metadata.repo_html_url} target="_blank" rel="noreferrer">
                    🧭 Repository
                  </a>
                </div>
                <div>
                  <a href={`${devInfo.metadata.repo_html_url}/issues`} target="_blank" rel="noreferrer">
                    🗂 All Issues
                  </a>
                </div>
              </>
            )}
          </div>

        <div className="row">
  <h3><strong>💬 Top Comments</strong></h3>
  {(devInfo.top_comments || []).length === 0 ? (
    <p style={{ opacity: 0.6 }}>No meaningful comments available</p>
  ) : (
    devInfo.top_comments.map((comment, idx) => (
      <div key={idx} className="comment-block">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {comment}
        </ReactMarkdown>
        {idx < devInfo.top_comments.length - 1 && <hr />}
      </div>
    ))
  )}
</div>



          {/* JSON BELOW */}
          <div className="row">
            <h3>Developer JSON</h3>
            <pre className="json-block">
              {JSON.stringify(devInfo.detailed_json, null, 2)}
            </pre>
            <button onClick={copyDevJSON}>📋 Copy Detailed JSON</button>
          </div>

          {/* Cache Management MOVED BELOW JSON */}
          <div className="row">
            <h3>📦 Cache Management</h3>
            <p>Cached analyses: {cacheCount}</p>
            <button style={{ background: "#A40E26" }} onClick={handleClearCache}>
              🗑 Clear Analysis Cache
            </button>
          </div>

          {/* Recent Analyses NEW */}
          <div className="row">
            <h3>🕘 Recent Analyses</h3>
            <ul>
              {recent.length === 0 && <p>No history yet</p>}
              {recent.map((item, index) => (
                <li key={index}>
                  {item.repo} — #{item.issue_number}
                </li>
              ))}
            </ul>
          </div>

        </section>
      )}

      {devLoading && (
        <section className="card fade-in">
          <h2>Loading developer info…</h2>
          <div className="skeleton text-line" style={{ width: "80%" }}></div>
          <div className="skeleton box-block" style={{ height: "60px", marginTop: "12px" }}></div>
        </section>
      )}
    </div>
  );
}

export default App;
