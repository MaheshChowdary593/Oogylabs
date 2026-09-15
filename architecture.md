# System Architecture Specification
## The Lenny Growth Assistant

---

## 1. System Topology & Component Diagram

```
+-----------------------------------------------------------------------------------+
|                                 BROWSER CLIENT                                   |
|   React 18 + Vite | Split-Pane Layout | Sandboxed Iframe Artifact Viewer        |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST & SSE Streaming
                                           v
+-----------------------------------------------------------------------------------+
|                                FASTAPI BACKEND API                                |
|  - API Routers: /chat/stream, /sessions, /models, /health, /transcripts/ingest     |
|  - LLM Provider Switcher: Ollama (Local) | Anthropic Claude | OpenAI             |
|  - Agentic Skills Engine: Ship 30 for 30 Essay | Artifact Parser                 |
|  - RAG Retrieval Engine: Hybrid Keyword + Vector Search                           |
+------------------------------------------+----------------------------------------+
                                           | Async Database Calls
                                           v
+-----------------------------------------------------------------------------------+
|                              POSTGRESQL + PGVECTOR                                |
|  - sessions, messages, artifacts, transcript_chunks                              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Database Schema (PostgreSQL)

### `sessions`
- `id` (UUID, Primary Key)
- `title` (VARCHAR 255)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `messages`
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key -> `sessions.id`)
- `role` (VARCHAR 20: `user` | `assistant` | `system`)
- `content` (TEXT)
- `citations_json` (JSONB: Array of Citation objects)
- `created_at` (TIMESTAMP)

### `artifacts`
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key -> `sessions.id`)
- `message_id` (UUID, Optional Foreign Key)
- `title` (VARCHAR 255)
- `artifact_type` (VARCHAR 20: `markdown` | `html`)
- `content` (TEXT)
- `created_at` (TIMESTAMP)

### `transcript_chunks`
- `id` (VARCHAR 100, Primary Key)
- `episode_title` (VARCHAR 255)
- `guest` (VARCHAR 100)
- `topic` (VARCHAR 150)
- `part` (VARCHAR 100)
- `source_url` (TEXT)
- `content` (TEXT)
- `created_at` (TIMESTAMP)

---

## 3. RAG Retrieval & Ingestion Workflow

1. **Ingestion**: Podcast transcripts are parsed into semantic chunks (500-800 tokens), annotated with episode titles, guest names, topics, and source links, and indexed in PostgreSQL.
2. **Retrieval**: When a query arrives:
   - Extracted keywords are matched against `transcript_chunks`.
   - Top-ranked chunks are scored and assembled into a structured `GROUNDED TRANSCRIPT CONTEXT` block.
3. **Citation Generation**: Extracted chunks are mapped into structured `CitationItem` badges delivered to the client via SSE metadata headers.

---

## 5. Resilience & Operational Failover Architecture

1. **Database Fallback**:
   - Primary: PostgreSQL + `pgvector` (`postgresql+asyncpg://...`).
   - Resilient Fallback: If PostgreSQL is unreachable or unconfigured (e.g. running `uvicorn` standalone outside Docker), the backend automatically traps `ConnectionRefusedError` and initializes a zero-dependency local SQLite database (`sqlite+aiosqlite:///./lenny_assistant.db`).
2. **LLM Provider Fallback**:
   - Primary: Selected UI toggle (`ollama`, `anthropic`, `openai`).
   - Resilient Fallback: If a cloud provider API key is missing or an endpoint times out, the backend gracefully falls back to Local Ollama with a system warning message.

