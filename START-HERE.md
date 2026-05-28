# Maximize — Complete Deployment Guide (Start to Finish)

This takes you from the zip file to a working AI-powered app on your iPad home screen. The API is already wired into the code — you don't edit anything. Total time: about 30 minutes the first time.

**You'll do everything from your iPad in Safari.** No coding apps, no terminal.

---

## What you need before you start

| Item | Where to get it | Cost |
|------|-----------------|------|
| The zip file | `maximize-deploy.zip` (in this chat) | — |
| GitHub account | github.com → Sign up | Free |
| Vercel account | vercel.com → "Continue with GitHub" | Free |
| Anthropic API key | You already have this ✅ | Pay-as-you-go (pennies to test) |

---

## The big picture (read this once)

Your app has three parts working together:

1. **The app** (what students see) — runs in their browser
2. **Two server functions** (`/api/lesson` and `/api/explain`) — run on Vercel's servers, hold your secret key, and call Claude
3. **Your API key** — stored safely in Vercel's settings, never in the code

When a student opens a lesson, the app asks your server function, the function asks Claude, and the lesson comes back — tailored to that student's survey answers. If the API ever fails, the app automatically falls back to built-in content so it never breaks.

---

## STEP 1 — Unzip the project on your iPad

1. Tap the **maximize-deploy** download link in this chat to save it
2. Open the **Files** app (blue folder icon)
3. Find `maximize-deploy.zip` (likely in **Downloads**)
4. **Tap it once** — it unzips into a folder called `maximize-deploy`
5. Open the folder. You should see: `api`, `public`, `src` folders plus `index.html`, `package.json`, and a few config files

✅ The `api` folder is the new important part — it holds `lesson.js` and `explain.js`.

---

## STEP 2 — Create your GitHub repository

1. In Safari, go to **github.com**, sign in
2. Tap **+** (top right) → **New repository**
3. Name: `maximize`
4. Set to **Public**
5. Leave everything else unchecked → **Create repository**

Keep this tab open.

---

## STEP 3 — Upload the files (the careful part)

GitHub on iPad can be fussy with folders. The reliable method: upload root files first, then create each folder by typing its name into the filename.

### 3a — Upload the root files

1. On your new repo page, tap **"uploading an existing file"**
2. Tap **choose your files**
3. From the `maximize-deploy` folder, select these (NOT inside any subfolder):
   - `index.html`
   - `package.json`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `.gitignore`
   - `README.md`
   - `API-INTEGRATION-GUIDE.md`
4. Tap **Open**, then scroll down and **Commit changes**

### 3b — Create the `src` folder and upload its files

1. Back on the repo page: **Add file → Create new file**
2. In the filename box type: `src/.gitkeep` → scroll down → **Commit new file**
   *(This creates the `src` folder.)*
3. Tap into the new **src** folder
4. Tap **Add file → Upload files**
5. Upload all 4 files from `maximize-deploy/src/`:
   - `MaximizeApp.jsx`
   - `main.jsx`
   - `index.css`
   - `api.js`
6. Commit

### 3c — Create the `api` folder and upload its files

1. Go back to the repo's main page
2. **Add file → Create new file** → filename: `api/.gitkeep` → **Commit**
3. Tap into the new **api** folder
4. **Add file → Upload files**
5. Upload both files from `maximize-deploy/api/`:
   - `lesson.js`
   - `explain.js`
6. Commit

### 3d — Create the `public` folder

1. Repo main page → **Add file → Create new file** → filename: `public/icon.svg`
2. Open `maximize-deploy/public/icon.svg` in Files (tap to preview), copy its contents, paste into GitHub
3. Commit

### 3e — Check your structure

Your repo's main page should show:

```
📁 api          → lesson.js, explain.js, .gitkeep
📁 public       → icon.svg
📁 src          → MaximizeApp.jsx, main.jsx, index.css, api.js, .gitkeep
📄 .gitignore
📄 README.md
📄 API-INTEGRATION-GUIDE.md
📄 index.html
📄 package.json
📄 postcss.config.js
📄 tailwind.config.js
📄 vite.config.js
```

If anything's misplaced, tap the file → pencil icon → fix the name (e.g. change `lesson.js` to `api/lesson.js` to move it). The earlier "Rollup failed to resolve /src/main.jsx" error you hit before was exactly this — files landing at the root instead of inside folders. Double-check `src/main.jsx` is really inside `src`.

---

## STEP 4 — Add your API key to Vercel (the secure part)

**Do this BEFORE deploying.**

1. Go to **vercel.com**, sign in with GitHub
2. Tap **Add New → Project**
3. Find `maximize` → tap **Import**
4. **Before clicking Deploy**, expand **Environment Variables**
5. Add one:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** paste your `sk-ant-...` key
6. Now tap **Deploy**

> If you already deployed without it: go to your project → **Settings → Environment Variables**, add it there, then **Deployments → ⋯ → Redeploy**.

This is the safe home for your key. It lives on Vercel's servers, never in your code, never visible to users.

---

## STEP 5 — Deploy

If you added the key during import, Vercel is already building. Wait ~90 seconds. You'll get a URL like `maximize-abc123.vercel.app`.

Tap it. You should see the MAXImize splash screen.

---

## STEP 6 — Test that the AI actually works

1. Go through the survey (pick distinctive answers — e.g. "overwhelmed," "needs support")
2. Open any featured lesson
3. You should see **"Your tutor is writing this lesson..."** then real, tailored content appear

**If it shows content instantly with no loading spinner**, it fell back to built-in content, which means the API didn't connect. Check:
- Is `ANTHROPIC_API_KEY` set in Vercel settings? (Step 4)
- Does your Anthropic account have billing set up? (console.anthropic.com → Billing)
- Check Vercel **Logs**: your project → Deployments → click the deployment → **Functions** tab → look for the error

---

## STEP 7 — Add to your iPad home screen

1. Open your Vercel URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share** button (square with up arrow)
3. Scroll down → **Add to Home Screen** → **Add**

The Maximize icon appears on your home screen. Tap it — it opens **full screen, no browser bars, no Claude**. That's your app.

---

## Cost & safety

- You're using `claude-sonnet-4-6` — smart and cheap. Each lesson costs a fraction of a cent.
- Testing it yourself: literally pennies. A few dollars covers hundreds of lessons.
- **Set a spending cap while testing:** console.anthropic.com → **Billing → Limits** → set a monthly cap (e.g. $20). Peace of mind.

---

## Updating the app later (from iPad)

1. Open your repo on github.com
2. Navigate to the file (e.g. `src/MaximizeApp.jsx`)
3. Tap the pencil → edit → **Commit changes**
4. Vercel auto-rebuilds in ~60 seconds

---

## When you have real users (the next optimization)

Right now every lesson view = one API call. Once students are using it:
1. Add a database (Vercel Postgres or Supabase — free tiers)
2. Save each generated lesson; reuse it for students with similar profiles
3. Only call the API for genuinely new lesson+profile combinations

This cuts costs massively. **Don't build it yet** — ship first, get real students at Wake Forest using it, then optimize based on what actually happens.

---

## If you get stuck

Screenshot the exact error (Vercel build logs or the Functions logs) and bring it back. The most common issue is folder structure in Step 3 — make sure `src/main.jsx`, `api/lesson.js`, and `api/explain.js` are really inside their folders, not at the root.

You've got this. Ship it.
