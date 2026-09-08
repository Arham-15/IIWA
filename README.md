# AttendanceSafe 🛡️

A full-stack web application designed for students to calculate how many classes they can safely skip (or must attend consecutively) while maintaining their university attendance threshold (default 75%).

## Features

- **Manual Calculation:** Enter total classes held, attended classes, and optional remaining semester classes.
- **AI Screenshot OCR:** Upload a screenshot from your university student portal / ERP; the AI vision model parses and sums all subjects automatically.
- **Safe Bunk & Shortfall Analysis:** Clear metrics on maximum allowable bunks or consecutive classes required to recover from a shortfall.
- **High Concurrency & Load Protection:** Backend uses rate limiting (`AI_RATE_LIMIT=6/minute`) and semaphore concurrency control (`MAX_CONCURRENT_AI_CALLS=10`) against traffic spikes.
- **Resilient Error Handling:** Friendly, human-readable notifications for rate limits (HTTP 429), unreadable screenshots (HTTP 422), unconfigured AI (HTTP 500), and network dropouts.
- **Zero Secret Leakage:** Environment variables and AI credentials remain strictly in the backend `.env` file.

---

## Project Structure

```
attendancesafe/
├── backend/
│   ├── main.py              # FastAPI server with slowapi and Groq OCR integration
│   ├── requirements.txt     # Python backend dependencies
│   ├── .env.example         # Environment template
│   ├── .env                 # Local configuration
│   └── test_api.py          # Pytest integration & unit test suite
└── frontend/
    ├── package.json         # React + Vite + Tailwind dependencies
    ├── vite.config.js       # Vite configuration with backend proxy
    ├── index.html           # HTML template
    └── src/
        ├── App.jsx          # Screen routing & state orchestrator
        ├── api/             # API client handling 422, 429, 500, 502
        └── components/      # Home, ManualEntry, AIUpload, Results, ErrorModal, Navbar
```

---

## Quickstart Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Add your `GROQ_API_KEY` to `backend/.env` (optional for manual calculations, required for AI screenshot OCR):
```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_VISION_MODEL=qwen/qwen3.6-27b
TARGET_PERCENTAGE=75
AI_RATE_LIMIT=6/minute
MAX_CONCURRENT_AI_CALLS=10
```

Start the FastAPI backend server:
```bash
uvicorn main:app --reload --port 8000
```

Run automated backend tests:
```bash
pytest
```

---

### 2. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend will be live at `http://localhost:5173`.

---

## API Endpoints

### `POST /calculate-manual`
- **Request Body (JSON):**
  ```json
  {
    "total": 50,
    "attended": 45,
    "remaining": 20
  }
  ```
- **Response (JSON):**
  ```json
  {
    "current_percentage": 90.0,
    "target_percentage": 75.0,
    "max_bunks": 12,
    "classes_needed": null,
    "message": "You're on track. You can skip up to 12 of your remaining 20 classes and still finish at 75% attendance."
  }
  ```

### `POST /calculate-ai`
- **Request:** `multipart/form-data` with field `file` (JPEG, PNG, or WEBP up to 20MB).
- **Response:** Identical JSON shape as `/calculate-manual`.
