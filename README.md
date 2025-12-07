# Seedling Labs — AI-Powered GitHub Issue Assistant

---

# Installation & Setup

This project includes both a *FastAPI backend* and a *React frontend*, and can be run either:

* Using Docker (recommended — under 5 minutes)
* Manually (Python + Node.js)

Below are simple, reliable instructions for both.

------------------------------------------------------------------

# Option 1: Run with Docker (Recommended)

This is the fastest and most reliable setup.
You do not need to install Python or Node.

------------------------------------------------------------------

1. Clone the repository

```
git clone https://github.com/AKASHKS06/AI-powered_Github_Issue_Assistant.git
cd AI-powered_Github_Issue_Assistant
```

------------------------------------------------------------------

2. Setup environment

This project uses Gemini LLM

Replace dummy API key in `.env` with API key from:
https://aistudio.google.com/api-keys

Steps:

1. Log in to Google AI Studio  
2. Go to API Keys  
3. Copy the API key  

Add it to the `.env` file:

```
GEMINI_API_KEY=your_api_key
```

Add your GitHub token to avoid rate limits:

```
GITHUB_TOKEN=your_github_pat_here
```

Get GitHub token from:
https://github.com/settings/tokens (select public_repo only)

------------------------------------------------------------------

3. Build and start the entire app

```
docker compose up --build
```
(Slow, but ensures API keys are saved)

```
docker compose up
```
(Faster. Use for subsequent runs)

This launches:

Service            | Port  | Description
-----------------|-------|---------------------------------------
Backend (FastAPI) | 8000  | GitHub fetching + AI analysis
Frontend (React)  | 3000  | User interface

------------------------------------------------------------------

4. Open the app

Frontend → http://localhost:3000  
Backend API docs → http://localhost:8000/docs  

------------------------------------------------------------------

5. Stop containers

```
docker compose down
```

------------------------------------------------------------------

6. Optional Cleanup

```
docker system prune -af
```

------------------------------------------------------------------

# Option 2: Manual Installation (Without Docker)

Use this method if you prefer running services separately.

------------------------------------------------------------------

## Backend Setup — FastAPI

```
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# or: source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at:  
http://localhost:8000  
http://localhost:8000/docs  

------------------------------------------------------------------

## Frontend Setup — React

```
cd frontend
npm install
npm start
```

Frontend runs at:  
http://localhost:3000  

------------------------------------------------------------------

# Environment Variables

Create `.env` file in project root:

```
GEMINI_API_KEY=your_api_key
GITHUB_TOKEN=your_github_pat_here
```

Recommended to avoid GitHub rate limits.

------------------------------------------------------------------

# Testing Installation

Use any public issue:

Repo: https://github.com/facebook/react  
Issue #: 1

Expected output:

* Summary  
* Analysis insights  
* Suggested labels  
* Developer metadata  
* JSON response  

------------------------------------------------------------------

# Troubleshooting

Issue | Fix
-----|----
White screen UI | Clear browser localStorage
GitHub 403 | Add token in `.env`
Backend not reachable | Ensure port 8000 is free
Docker slow on Windows | Enable WSL2 backend

------------------------------------------------------------------

# Done!
