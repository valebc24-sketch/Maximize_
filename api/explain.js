// /api/explain.js
// Powers the Reader's "Quick Summary" and highlight-to-explain panel.
// The browser sends selected text (or a whole document) and a mode;
// this returns the explanation, simpler version, example, or summary.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured.' });
  }

  try {
    const { mode, text, profile } = req.body || {};
    if (!text) return res.status(400).json({ error: 'No text provided.' });

    const simple = profile?.simpleLanguage;

    // Different instructions per mode.
    const instructions = {
      explain: `Explain what this passage means in clear terms. Focus on the core idea and why it matters.`,
      simpler: simple
        ? `Rewrite this in very simple, plain English. Short sentences. No jargon. Imagine explaining to someone new to the topic.`
        : `Restate this in plain, everyday language, stripping away jargon while keeping the meaning.`,
      example: `Give one concrete, relatable real-world example or analogy that makes this passage click.`,
      summary: `Summarize the entire text below in 2-3 sentences, then list 3-5 key points. Return JSON: {"summary": "...", "points": ["...", "..."]}`,
    };

    const instruction = instructions[mode] || instructions.explain;

    const systemPrompt = `You are Maximize, a patient tutor. ${
      profile?.encouragingTone ? 'Use a warm, encouraging tone. ' : ''
    }${simple ? 'Use simple language. ' : ''}Be concise and genuinely helpful.${
      mode === 'summary' ? ' Return only valid JSON, no markdown.' : ''
    }`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `${instruction}\n\nText:\n"""\n${text.slice(0, 6000)}\n"""`,
        }],
      }),
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'The helper service had a problem.' });
    }

    const data = await response.json();
    const result = data.content?.[0]?.text || '';

    if (mode === 'summary') {
      try {
        const parsed = JSON.parse(result.replace(/```json|```/g, '').trim());
        return res.status(200).json(parsed);
      } catch {
        return res.status(200).json({ summary: result, points: [] });
      }
    }

    return res.status(200).json({ explanation: result });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
