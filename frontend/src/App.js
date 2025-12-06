import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:8000/analyze_issue";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [issueNumber, setIssueNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Load cached result on startup
  useEffect(() => {
    const cached = localStorage.getItem("cachedResult");
    if (cached) setResult(JSON.parse(cached));
  }, []);

  const handleAnalyze = async () => {
    setError("");

    if (!repoUrl.trim()) {
      setError("Please enter a valid GitHub repository URL.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_URL, {
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
        setResult(data);
        localStorage.setItem("cachedResult", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      setError("Could not connect to backend. Is FastAPI running?");
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    alert("Copied JSON to clipboard! 📋");
  };

  const saveManually = () => {
    localStorage.setItem("cachedResult", JSON.stringify(result));
    alert("Analysis saved locally! 💾");
  };

  return (
    <div className="app">

      {/* HERO TITLE ONLY */}
      <section className="intro">
        <h1>🌱 Seedling Labs — AI-Powered GitHub Issue Assistant</h1>
      </section>

      {/* Analyze Issue Form */}
      <section className="card">
        <h2>Analyze an Issue</h2>

        <label className="field">
          <span>GitHub Repo URL</span>
          <input
            type="text"
            placeholder="https://github.com/facebook/react"
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

      {/* Status messages BELOW Analyze card */}
      {!loading && result && !error && (
        <div className="status success">Analysis complete ✔</div>
      )}

      {error && <div className="status error">{error}</div>}

      {/* Results Card */}
      {result && (
        <section className="card">
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
            <h3>Raw JSON</h3>
            <pre className="json-block">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>

          <div className="result-buttons">
            <button onClick={copyJSON}>📋 Copy JSON</button>
            <button onClick={saveManually} style={{ background: "#10B981" }}>
              💾 Save Result
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
