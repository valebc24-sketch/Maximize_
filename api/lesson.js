// /api/lesson.js
// Vercel Serverless Function — runs on Vercel's servers, NOT in the browser.
// This is where your secret API key lives. Users never see it.
//
// The browser sends a POST request here describing what to teach and who the
// learner is. This function asks Claude to generate a lesson, then returns it.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Your API key is stored as a Vercel Environment Variable (set in dashboard).
  // It is NEVER in your code or sent to the browser.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on the server.' });
  }

  try {
    const { topic, profile, sourceText } = req.body || {};

    if (!topic) {
      return res.status(400).json({ error: 'Missing topic.' });
    }

    // Build a learner description from the survey profile so Claude tailors the lesson.
    const learnerProfile = buildLearnerDescription(profile);

    // The system prompt tells Claude HOW to behave as a tutor.
    const systemPrompt = `You are Maximize, a warm, encouraging personal tutor built for students who learn differently. You create lessons tailored to each student's needs.

Here is the student you are teaching:
${learnerProfile}

Your job: produce ONE focused lesson on the requested topic, broken into a sequence of "chunks." Adapt everything — vocabulary, depth, tone, examples — to this specific student.

Return ONLY valid JSON (no markdown, no backticks, no preamble) in exactly this shape:
{
  "chunks": [
    { "type": "text", "heading": "Short heading", "body": "1-3 sentences of explanation." },
    { "type": "interactive", "body": "Setup text.", "prompt": "A question for the student to think about.", "answer": "The reveal/answer." },
    { "type": "check", "question": "A quiz question.", "options": ["A","B","C","D"], "correct": 1, "explanation": "Why that answer is right." }
  ]
}

Rules:
- Use "text" chunks for teaching, "interactive" for reflection prompts, "check" for quiz questions.
- "correct" is the 0-based index of the right option.
- Match the student's depth and vocabulary level. If they need simpler language, use it.
- If they feel overwhelmed or anxious, keep an encouraging, low-pressure tone.
- 5 to 9 chunks per lesson. End with at least one "check".`;

    // The user message describes the specific lesson to build.
    let userMessage = `Create a lesson on: "${topic.title}".`;
    if (topic.description) userMessage += `\nThe student specifically wants it to cover: ${topic.description}`;
    if (topic.kind) userMessage += `\nThis is a "${topic.kind}" type lesson within a larger study plan.`;
    if (sourceText) {
      // If teaching from uploaded class material, include an excerpt.
      const excerpt = sourceText.slice(0, 8000); // keep request size reasonable
      userMessage += `\n\nBase the lesson on this source material the student uploaded:\n"""\n${excerpt}\n"""`;
    }

    // Call the Claude API.
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',  // fast + smart + cost-effective for student traffic
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Claude API error:', errText);
      return res.status(502).json({ error: 'The tutor service had a problem. Try again.' });
    }

    const data = await response.json();
    const rawText = data.content?.[0]?.text || '';

    // Claude should return clean JSON, but strip any stray markdown fences just in case.
    const cleaned = rawText.replace(/```json|```/g, '').trim();

    let lesson;
    try {
      lesson = JSON.parse(cleaned);
    } catch (e) {
      console.error('Could not parse lesson JSON:', cleaned.slice(0, 500));
      return res.status(502).json({ error: 'The tutor returned something unexpected. Try again.' });
    }

    return res.status(200).json(lesson);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Something went wrong generating the lesson.' });
  }
}

// Turns the survey profile into a plain-English description for Claude.
function buildLearnerDescription(profile) {
  if (!profile) return 'A general student. No special accommodations specified.';
  const lines = [];
  if (profile.modality) lines.push(`- Learns best through: ${profile.modality}`);
  if (profile.pace) lines.push(`- Preferred pace: ${profile.pace}`);
  if (profile.level) lines.push(`- Level: ${profile.level}`);
  if (profile.goal) lines.push(`- Their goal: ${profile.goal}`);
  if (profile.feeling) lines.push(`- Currently feeling: ${profile.feeling} about studying`);
  if (profile.hasADHD) lines.push('- Has ADHD — keep chunks short and engaging.');
  if (profile.hasDyslexia) lines.push('- Has dyslexia — use clear, simple sentences.');
  if (profile.hasAnxiety) lines.push('- Gets test anxiety — keep quizzes low-pressure and reassuring.');
  if (profile.hasLanguage) lines.push('- English is not their first language — avoid idioms and jargon.');
  if (profile.simpleLanguage) lines.push('- IMPORTANT: Use simple, plain language throughout.');
  if (profile.encouragingTone) lines.push('- IMPORTANT: Use a warm, encouraging tone. They need support.');
  if (profile.depthLevel === 'deep') lines.push('- Wants deep understanding — go beyond the surface.');
  if (profile.depthLevel === 'exam-focused') lines.push('- Studying for exams — emphasize what gets tested and common mistakes.');
  return lines.join('\n') || 'A general student.';
}
