// src/api.js
// Tiny helper the front-end uses to talk to YOUR serverless functions.
// These call /api/lesson and /api/explain — your own server routes —
// never the Anthropic API directly. The secret key stays server-side.

// Generate a full lesson tailored to the student.
// topic: { title, description?, kind? }
// profile: the survey profile object
// sourceText: optional uploaded class material to teach from
export async function generateLesson(topic, profile, sourceText) {
  const res = await fetch('/api/lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, profile, sourceText }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Could not generate the lesson.');
  }
  return res.json(); // → { chunks: [...] }
}

// Explain / simplify / give an example for highlighted reader text.
// mode: 'explain' | 'simpler' | 'example'
export async function explainText(mode, text, profile) {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, text, profile }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Could not explain that.');
  }
  const data = await res.json();
  return data.explanation;
}

// Summarize a whole document for the reader's "Quick Summary".
export async function summarizeText(text, profile) {
  const res = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'summary', text, profile }),
  });
  if (!res.ok) throw new Error('Could not summarize.');
  return res.json(); // → { summary, points }
}
