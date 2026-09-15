# 🚀 The Lenny Growth Assistant
> **A Grounded AI Product & Growth Assistant built on transcripts from Lenny's Podcast.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![Ollama](https://img.shields.io/badge/Ollama-Local_LLM-black?style=flat-square)](https://ollama.ai)

---

## 📌 Executive Summary

**The Lenny Growth Assistant** turns hundreds of hours of transcripts from **Lenny's Podcast & Newsletter** into an executive-ready internal product & growth consultant. It provides:
1. **Source-Grounded Answers**: Every statement is backed by traceable transcript metadata citations (`[Guest Name - Episode Title]`).
2. **Flexible LLM Provider Toggle**: Switch seamlessly between **Local Ollama** (offline-capable) and Cloud Providers (**Anthropic Claude**, **OpenAI**) without code changes.
3. **Ship 30 for 30 Content Skill**: Transforms grounded insights into structured ~1,250-word longform growth essays with magnetic hooks and actionable frameworks.
4. **Side-by-Side Sandboxed Artifact Viewer**: Renders generated Markdown documents and interactive HTML/CSS cards natively inside an isolated security iframe (`sandbox="allow-scripts"`).

---

## 🛠️ Quickstart: 1-Command Docker Setup

### Prerequisites
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) installed.
- (Optional for local LLM demo): [Ollama](https://ollama.ai) installed and running locally on port 11434 (`ollama run qwen2.5:latest` or `ollama run llama3`).

### 1-Command Launch
Clone the repository and run:

```bash
docker-compose up --build
```

Access the application components:
- 🎨 **Web Frontend UI**: `http://localhost:3000`
- ⚡ **FastAPI Backend Docs**: `http://localhost:8000/docs`
- 🐘 **PostgreSQL Database**: `localhost:5432` (`lenny_assistant`)

---

## ⚙️ LLM Configuration & Model Toggle

The assistant features a dynamic model switcher layer accessible via the UI header or `.env` configuration.

### Local Ollama Setup (Mandatory for Offline Demo)
1. Install Ollama: `brew install ollama` (macOS) or download from [ollama.ai](https://ollama.ai).
2. Pull your preferred model:
   ```bash
   ollama pull qwen2.5:latest
   # OR
   ollama pull llama3
   ```
3. Ensure Ollama service is running (`ollama serve`).

### Cloud Providers (Optional)
Copy `.env.example` to `.env` and fill in your keys:
```env
DEFAULT_LLM_PROVIDER=ollama

ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-proj-...
```

*Fallback Behavior*: If a cloud API key is missing or invalid, the backend automatically logs a warning and falls back to Local Ollama gracefully.

---

## 📁 Repository Structure

```
.
├── docker-compose.yml          # Production 1-command startup manifest
├── README.md                   # System documentation & evaluation guide
├── PRD.md                      # Product Requirements Document & Discovery Brief
├── architecture.md             # System topology, DB schema & security isolation
├── design.md                   # UI/UX glassmorphism design system specs
├── .env.example                # Safe default environment configuration
├── agent_transcripts/          # Agent execution logs & routing traces
├── data/
│   └── lenny_transcripts/      # Seed dataset of curated podcast transcripts
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app/
│   │   ├── main.py             # FastAPI entrypoint
│   │   ├── config.py           # Environment settings
│   │   ├── database.py         # Async SQLAlchemy setup
│   │   ├── models/             # Database SQL models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── llm_factory.py  # Model switcher (Ollama/Claude/OpenAI)
│   │   │   ├── rag_engine.py   # Hybrid vector/keyword retrieval
│   │   │   ├── agent_service.py# SSE streaming & orchestration
│   │   │   └── skills/         # Ship 30 for 30 & Artifact skills
│   │   └── api/v1/             # API REST routers
│   └── tests/                  # Pytest automated test suite
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── index.css           # Design tokens & glassmorphism theme
        ├── App.jsx             # Top-level state manager
        ├── components/
        │   ├── Header.jsx      # Model switcher & controls
        │   ├── Sidebar.jsx     # Session history drawer
        │   ├── Chat/           # Streaming chat & citation badges
        │   └── Artifact/       # Sandboxed HTML/MD viewer
```

---

## 🧪 Automated Testing

Run backend automated integration tests:

```bash
cd backend
python -m pytest tests/
```

### Included Tests:
- `test_rag.py`: Verifies transcript seeding, hybrid keyword search, and citation formatting.
- `test_llm_factory.py`: Verifies model switching and fallback handling.
- `test_skills.py`: Asserts Ship 30 for 30 essay generation rules and artifact parsing.
- `test_api.py`: Tests FastAPI endpoints (`/health`, `/models`, `/sessions`, `/chat/stream`).

---

## 🎬 Demo Video Guide

A 2-3 minute YouTube walk-through demonstrating:
1. Product overview & Grounded RAG query (*"What are Elena Verna's key growth loops for B2B PLG?"*).
2. Live local evaluation using **Ollama**.
3. **Ship 30 for 30 Essay Skill** generation (~1,250 words).
4. Side-by-side **Artifact Viewer** rendering an HTML growth card inside the sandboxed iframe.
5. Discussion of technical trade-offs (RAG grounding precision vs latency, sandboxed security isolation).
