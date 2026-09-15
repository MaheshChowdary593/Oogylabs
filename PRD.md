# Product Requirements Document (PRD) & Discovery Brief
## Project: The Lenny Growth Assistant

---

## 1. Discovery Brief & Problem Alignment

### 1.1 Primary User & Persona
- **Primary User**: Product Managers (PMs), Growth Engineers, Product Marketing Managers, and Founders.
- **Jobs To Be Done (JTBD)**:
  - Quickly find battle-tested product & growth frameworks (e.g., PLG loops, retention curves, PMF engines, LNO productivity).
  - Transform transcript insights into polished, executive-ready growth essays (~1,250 words) using proven content structures (Ship 30 for 30).
  - Render interactive HTML visual cards, framework specs, or PRD templates directly inside the workspace without switching contexts.
- **Current Pain Points**:
  - Lenny's Podcast has hundreds of hours of high-value transcripts, making search manual, slow, and fragmented.
  - One-off ChatGPT prompts often produce ungrounded generic advice ("hallucinations") without concrete source attribution.
  - Exporting LLM text into visual artifacts requires copy-pasting into external tools.

### 1.2 Success Metrics
- **Grounding Precision**: 100% of factual growth claims accompanied by traceable transcript metadata badges (`[Guest Name - Episode Title]`).
- **Artifact Isolation Safety**: 0% XSS security vulnerabilities via strict `iframe` sandboxing (`sandbox="allow-scripts"` without same-origin privileges).
- **Operational Latency**: Sub-3-second Time-To-First-Token (TTFT) via Server-Sent Events (SSE) streaming on Local Ollama.
- **Onboarding Velocity**: 1-command startup via `docker-compose up --build` in under 3 minutes.

### 1.3 Key Assumptions
- Evaluators and users may run locally on Apple Silicon / x86 machines without active Cloud API keys; hence, a robust **Local Ollama LLM mode is mandatory**.
- Transcripts are structured into semantic chunks with speaker attributions, episode titles, and source URLs.

### 1.4 Scope Choices & Explicit Non-Goals
- **In Scope**:
  - FastAPI backend server with SSE streaming.
  - PostgreSQL + `pgvector` database persistence for chat sessions, messages, artifacts, and transcripts.
  - Hybrid RAG search engine with citation tracking.
  - Flexible Model Toggle (Ollama local, Anthropic Claude, OpenAI).
  - Ship 30 for 30 content generation skill (~1,250 words).
  - Side-by-side Sandboxed HTML/Markdown Artifact Viewer.
- **Out of Scope (Explicit Non-Goals)**:
  - Multi-tenant JWT user authentication (optimized for key-less local evaluation).
  - Real-time live audio transcription scraping.

---

## 2. Risk Matrix & Mitigation Strategies

| Risk Factor | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Hallucination** | High | Strict RAG prompt injection forcing explicit transcript citations or polite admission of context absence. |
| **XSS Vulnerabilities in HTML Artifacts** | Critical | Render HTML artifacts inside isolated `<iframe>` elements with `sandbox="allow-scripts"` (restricting `window.parent`, localStorage, or API key leakage). |
| **Local LLM Latency & Offline Status** | Medium | Streaming SSE responses for instant perceived performance + real-time status health checks in the UI header. |
| **Missing API Keys** | Low | Dynamic fallback mechanism defaulting to Ollama if Anthropic/OpenAI keys are unconfigured. |

---

## 3. Feature Specifications & Acceptance Criteria

### 3.1 Grounded Conversational Assistant
- **AC 1.1**: User can send product/growth queries and receive streamed answers.
- **AC 1.2**: Every statement must cite its source transcript using a clickable badge displaying episode title, guest name, and excerpt modal.

### 3.2 Ship 30 for 30 Content Skill
- **AC 2.1**: When requested or toggled, the assistant transforms grounded answers into a ~1,250-word essay.
- **AC 2.2**: Essay MUST follow the 5-part structure: Hook, Reframe, 3-Part Framework, Guest Case Studies, Actionable Takeaways.

### 3.3 Artifact Generation & Sandboxed Viewer
- **AC 3.1**: The assistant automatically detects requests for HTML cards or documents and wraps them in artifact block delimiters.
- **AC 3.2**: The frontend automatically opens a split-pane Artifact Viewer allowing toggle between Rendered View and Raw Code Source, with Export/Copy capabilities.
