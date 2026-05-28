# Connecting the Claude API to Maximize

This makes Maximize *actually* generate lessons and explanations with AI, instead of using the built-in placeholder content. After this, when a student opens a lesson or highlights text, a real AI tutor responds — tailored to their survey answers.

---

## How it works (the important concept)

Your app runs in the **browser**. The API key is a **secret** — if it's in the browser, anyone can steal it. So we never put it there.

Instead, we add two small files in an `/api` folder. Vercel automatically turns these into **serverless functions** — little programs that run on Vercel's servers. The browser asks *them* for a lesson; *they* hold the secret key and call Claude; they send the result back.

```
Browser (Maximize app)  →  /api/lesson  (your server, has the key)  →  Claude API
                        ←                                            ←
```

You don't manage a server. Vercel does it automatically because the files are in `/api`.

---

## What's included

| File | What it does |
|------|--------------|
| `api/lesson.js` | Generates a full tailored lesson from a topic + the student's profile (and optionally uploaded class text) |
| `api/explain.js` | Powers the Reader: explain / simplify / example / summarize |
| `src/api.js` | The tiny helper the front-end uses to call those two functions |

---

## STEP 1 — Get an API key

1. Go to **console.anthropic.com** and sign in (or sign up)
2. Add a payment method under **Billing** (the API is pay-as-you-go — see cost notes at the bottom; it's cheap for testing)
3. Go to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-...`). **Save it somewhere safe — you only see it once.**

---

## STEP 2 — Add the key to Vercel (NOT to your code)

1. In **vercel.com**, open your `maximize` project
2. Go to **Settings → Environment Variables**
3. Add a new variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your `sk-ant-...` key
   - Apply to: Production, Preview, and Development (check all)
4. Save

This is the secure place. The key lives on Vercel's servers, never in your repo, never in the browser.

---

## STEP 3 — Add the two API files to your repo

In GitHub (in Safari on your iPad):

1. Open your `maximize` repo
2. **Add file → Create new file**
3. Filename: `api/lesson.js` (the `api/` prefix creates the folder)
4. Paste the contents of `api/lesson.js` from this package
5. Commit
6. Repeat for `api/explain.js`

---

## STEP 4 — Add the helper to your app

1. **Add file → Create new file**
2. Filename: `src/api.js`
3. Paste the contents of `src/api.js` from this package
4. Commit

---

## STEP 5 — Wire the app to use it

This is the only edit to your main app file (`src/MaximizeApp.jsx`). You're swapping the placeholder lesson content for a real API call. Two spots:

### A) At the top of MaximizeApp.jsx, add the import

Right under the existing `import` lines, add:

```jsx
import { generateLesson, explainText, summarizeText } from './api';
```

### B) Make the Lesson component fetch real content

Find the `Lesson` function (search for `function Lesson(`). At the very top of it, it currently does:

```jsx
const content = getLessonContent(contentKey, profile, topic);
const chunks = content.chunks;
```

Replace those two lines with this — it fetches from the API and falls back to the built-in content if anything fails:

```jsx
const [chunks, setChunks] = useState(null);
const [loadErr, setLoadErr] = useState(false);

useEffect(() => {
  let cancelled = false;
  setChunks(null); setLoadErr(false);
  generateLesson(
    { title: topic.title, description: topic.description, kind: topic.kind },
    profile,
    topic._sourceText  // uploaded class text, if any
  )
    .then(lesson => { if (!cancelled) setChunks(lesson.chunks); })
    .catch(() => {
      // Fall back to built-in content so the app never breaks
      if (!cancelled) { setChunks(getLessonContent(contentKey, profile, topic).chunks); setLoadErr(true); }
    });
  return () => { cancelled = true; };
}, [topic.id]);

// Loading state while the AI writes the lesson
if (!chunks) {
  return (
    <div className="max-w-xl mx-auto text-center mt-20">
      <Loader2 className="w-12 h-12 text-red-700 animate-spin mx-auto mb-4" />
      <div className="text-stone-800 font-bold tracking-widest uppercase text-sm" style={{ fontFamily: '"Futura", sans-serif' }}>
        Your tutor is writing this lesson...
      </div>
    </div>
  );
}
```

Then a few lines down, DELETE the old `const total = chunks.length;` line ONLY IF it now appears twice — keep one. Everything else in the Lesson component already works with `chunks`.

That's the core integration. The lesson now comes from Claude, tailored to the student.

### C) (Optional) Wire the Reader's explain panel

In the `Reader` component, find the `explain` function that returns canned text. Replace its body with a real call. The simplest version: add state and fetch when the panel opens. This is optional polish — do it after lessons work.

---

## STEP 6 — Deploy and test

1. Every file you committed already triggered a Vercel rebuild
2. Open your live app, go through the survey, open a lesson
3. You should see "Your tutor is writing this lesson..." then real, tailored content appear

If it falls back to placeholder content, check:
- Is `ANTHROPIC_API_KEY` set in Vercel settings (Step 2)?
- Did you add billing to your Anthropic console account?
- Check Vercel's **Logs** tab (Deployments → your deployment → Functions) for the actual error

---

## What it costs (be honest with yourselves)

You're using `claude-sonnet-4-6` — the sweet spot of smart + affordable. Rough math:

- A typical generated lesson is ~2,000 output tokens + ~1,000 input tokens
- At Sonnet 4.6 rates, that's a fraction of a cent per lesson
- **Testing it yourselves: pennies.** A few dollars covers hundreds of lessons.
- Real scale (thousands of students) is where you'd add caching — generate a lesson once, save it, reuse it — instead of calling the API every single time. That's a later optimization.

To avoid surprises: in the Anthropic console under **Billing → Limits**, set a monthly spend cap (e.g. $20) while testing.

---

## The smart next optimization (when you have users)

Right now every lesson view = one API call. To save money and make it instant:

1. Add a database (Vercel Postgres or Supabase — both have free tiers)
2. When a lesson is generated, **save it** keyed by topic + profile type
3. Next time someone with a similar profile wants that lesson, serve the saved one
4. Only call the API for genuinely new combinations

This turns thousands of API calls into dozens. But don't build it yet — get lessons working first, get real students using it, *then* optimize based on what actually happens.

---

## Summary of what you built

- ✅ A secure server layer (the `/api` functions) that protects your key
- ✅ Real AI lesson generation tailored to each student's survey
- ✅ Real AI explanations in the reader
- ✅ Graceful fallback to built-in content if the API ever fails
- ✅ A clear path to scale affordably with caching

This is the piece that makes Maximize a real product instead of a prototype. Ship it, watch real students use it, and let what you learn guide what you build next.
