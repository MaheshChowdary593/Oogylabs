# Agent Execution & Skill Routing Logs
## The Lenny Growth Assistant

This directory contains execution traces, routing decisions, tool invocation logs, failed attempts, and self-correction steps recorded during agent development.

---

## Trace 1: Grounded RAG Query & Citation Generation

### Input Query:
> "What are Elena Verna's key growth loops for B2B PLG?"

### Routing Decision:
- Skill Trigger: `auto` (Grounded Assistant Mode)
- Provider Selected: `ollama` (Local Model)

### RAG Retrieval Output:
- Matched 2 chunks from `TranscriptChunkDB`:
  1. `[Elena Verna - B2B Product-Led Growth, Freemium vs Trial]` (Score: 8)
  2. `[Elena Verna - Freemium vs Reverse Trial Strategy]` (Score: 6)

### LLM Output Stream:
> Product-Led Growth (PLG) according to Elena Verna is an end-to-end go-to-market strategy where the product itself drives acquisition, retention, and expansion `[Elena Verna - B2B Product-Led Growth, Freemium vs Trial]`. Elena highlights that acquisition loops occur when active users naturally invite collaborators...

### Evaluation:
- Grounding: Pass (Correct inline citations attached).

---

## Trace 2: Ship 30 for 30 Content Generation & Self-Correction

### Input Query:
> "Write a Ship 30 for 30 essay on retention by Casey Winters"

### Initial Attempt & Defect Discovered:
- **Issue**: Initial prompt did not enforce structured sub-headings or word length requirements strictly enough; LLM generated a brief 300-word response.
- **Correction Applied**: Updated `Ship30Skill.SYSTEM_INSTRUCTIONS` to explicitly mandate 5 distinct sections:
  1. The Hook (Pattern Interrupt)
  2. The Reframe (Why conventional wisdom fails)
  3. The 3-Step Framework
  4. Podcast Guest Evidence (Casey Winters)
  5. Immediate Actionable Checklist
- **Result**: Successfully generated ~1,250-word structured essay wrapped inside a Markdown Artifact.

---

## Trace 3: HTML Artifact Generation & Sandboxed Iframe Rendering

### Input Query:
> "Generate an HTML growth experiment tracking dashboard card artifact"

### Routing Decision:
- Skill Trigger: `artifact`
- Delimiter Output: `<<<ARTIFACT title="Growth Experiment Card" type="html">>>...<<<END_ARTIFACT>>>`

### Backend Action:
- Parsed delimiter, created `ArtifactDB` record (UUID: `art-9912`), emitted SSE `artifact` event.

### Frontend Action:
- Received `artifact` event, opened split-pane `ArtifactViewer`, loaded HTML into `SandboxedIframe` with `sandbox="allow-scripts"`.
