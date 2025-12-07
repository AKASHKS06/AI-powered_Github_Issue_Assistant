🌱 Seedling Labs — AI-Powered GitHub Issue Assistant

Analyze GitHub issues intelligently using LLMs, suggest issue types, priorities, labels, developer insights, and more.

Scans real GitHub issues → Fetches metadata → AI analyzes context → Returns structured JSON + smart summaries.

🚀 Features

✔ AI-powered issue classification & prioritization
✔ Suggested GitHub labels
✔ Developer insights (author, timestamps, metadata)
✔ Smart comment filtering (skips “+1”, emojis, spam)
✔ Clean JSON export + copy buttons
✔ FastAPI backend + React frontend
✔ Fully containerized (Docker Compose)

📦 Installation & Setup

This project includes:

Component	Tech	Port
Backend	FastAPI	8000
Frontend	React	3000

You can run via:

🐳 Docker (Recommended — 1 command only)

🖥️ Manual setup (Node + Python)

🐳 Option 1 — Run with Docker (Recommended)

Requires only Docker Desktop installed.

1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/seedling-labs-ai-github-assistant.git
cd seedling-labs-ai-github-assistant

2️⃣ Setup environment

Copy the example file:

cp .env.example .env


Then insert:

GITHUB_TOKEN=your_github_pat_here   # recommended to avoid rate limits

3️⃣ Start everything
docker compose up --build

4️⃣ Access the app
URL	Description
🔗 http://localhost:3000
React UI
🔗 http://localhost:8000/docs
Backend API docs (Swagger UI)
5️⃣ Stop / Cleanup
docker compose down   # stop
docker system prune -af  # optional cleanup

🛠 Option 2 — Manual Installation (Without Docker)

If you prefer running services individually:

Backend Setup (FastAPI)
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate on macOS/Linux

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000


Access backend:

http://localhost:8000
http://localhost:8000/docs

Frontend Setup (React)

Open another terminal:

cd frontend
npm install
npm start


Runs at

http://localhost:3000

🔑 Environment Variables

Create a .env file in the project root (or backend root):

GITHUB_TOKEN=your_github_personal_access_token_here


📌 GitHub token recommended to avoid API rate limits.

✨ Example Usage

Try analyzing a real issue:

Input	Example
Repository	https://github.com/facebook/react
Issue Number	1

Output will include:

📝 Summary

🪛 Type classification (bug, feature, etc.)

🚦 Priority score

🏷 Suggested labels

💡 Developer info

🧱 JSON structure you can reuse

❗ Troubleshooting
Issue	Solution
White screen on load	Clear local storage (cached JSON)
Rate limit exceeded	Add GitHub token in .env
Backend not reachable	Make sure port 8000 not blocked
Docker slow on Windows	Enable WSL2 backend in Docker Desktop
📌 Tech Stack
Category	Tools
Frontend	React, Fetch API, Tailwind-style CSS
Backend	FastAPI, Pydantic, Uvicorn
AI	Gemini API (via google-generativeai)
Deployment	Docker Compose
🛡 Security Notes

✔ .env is ignored by git
✔ .env.example is safe to upload
✔ No sensitive API keys should go into UI

🤝 Contributing

Pull requests are welcome!
Feel free to open issues for feature requests or enhancements.

📜 License

MIT License © 2025 Seedling Labs
