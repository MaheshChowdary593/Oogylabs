const API_BASE = '/api/v1';

export async function fetchModels() {
  const res = await fetch(`${API_BASE}/models`);
  if (!res.ok) throw new Error('Failed to fetch models');
  return res.json();
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}

export async function createSession() {
  const res = await fetch(`${API_BASE}/sessions`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function fetchSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`);
  if (!res.ok) throw new Error('Failed to fetch session details');
  return res.json();
}

export async function deleteSession(sessionId) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete session');
  return true;
}

export async function streamChat({ sessionId, message, provider, skill, onMeta, onChunk, onArtifact, onDone, onError }) {
  try {
    const response = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        message,
        provider,
        skill
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startswith && trimmed.startswith('data: ')) {
          const raw = trimmed.substring(6).trim();
          if (raw === '[DONE]') {
            if (onDone) onDone();
            return;
          }
          try {
            const data = JSON.parse(raw);
            if (data.type === 'meta' && onMeta) {
              onMeta(data);
            } else if (data.type === 'text' && onChunk) {
              onChunk(data.content);
            } else if (data.type === 'artifact' && onArtifact) {
              onArtifact(data.artifact);
            }
          } catch (e) {
            console.error('Failed to parse SSE payload:', raw, e);
          }
        }
      }
    }
    if (onDone) onDone();
  } catch (err) {
    if (onError) onError(err);
  }
}
