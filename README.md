# Maximize — iPad Deployment Guide

Everything you need to put Maximize on the internet and on your iPad's home screen. You're doing this entirely from your iPad in Safari. No coding apps, no terminal. Total time: ~25 minutes.

---

## Before you start — what you'll need

| Need | How to get it | Time |
|------|---------------|------|
| GitHub account | Go to **github.com** → Sign up | 3 min |
| Vercel account | Go to **vercel.com** → "Continue with GitHub" | 1 min |
| The zip file | `maximize-deploy.zip` (already in this chat) | — |
| The Files app | Already on every iPad | — |

That's it. No credit card. Both are free forever for personal projects.

---

## STEP 1 — Unzip the project file on your iPad

**What file you need:** `maximize-deploy.zip`

1. In this Claude chat, tap the **maximize-deploy** download link to save the zip to your iPad
2. Open the **Files** app (it's a blue folder icon — already installed on every iPad)
3. Find `maximize-deploy.zip` (probably in **Downloads** or **On My iPad**)
4. **Tap once** on the zip file — it automatically unzips into a folder called `maximize-deploy`

✅ **You should now see:** A folder called `maximize-deploy` containing files like `package.json`, `index.html`, and folders called `src` and `public`.

---

## STEP 2 — Create a GitHub repository

**What this does:** GitHub is free online storage for code. Vercel reads from GitHub to deploy your site.

1. In Safari on your iPad, go to **github.com** and sign in
2. Tap the **+** icon in the top right → **New repository**
3. Fill in:
   - **Repository name:** `maximize`
   - **Public** (must be public for free Vercel)
   - **Leave everything else unchecked** (no README, no gitignore, no license)
4. Tap **Create repository**

✅ **You should now see:** A page that says "Quick setup" with a URL like `github.com/yourname/maximize.git`. Keep this Safari tab open.

---

## STEP 3 — Upload the project files to GitHub

**What files you need:** Everything inside the `maximize-deploy` folder you unzipped in Step 1.

GitHub on iPad lets you upload files directly through the browser — no Git commands needed.

1. On that same GitHub page from Step 2, look for the link that says **"uploading an existing file"** (it's in the middle of the page, in the "Quick setup" box). Tap it.
2. You'll see a big dotted box that says "Drag files here to add them to your repository, or **choose your files**"
3. Tap **choose your files**
4. The Files app opens. Navigate to your `maximize-deploy` folder.
5. Tap **Select** in the top right, then tap each file and folder you need to upload (see the list below)
6. Tap **Open** to upload them

**What to upload (everything inside `maximize-deploy`):**

| File/Folder | What it is |
|-------------|-----------|
| `index.html` | Page that loads when someone visits |
| `package.json` | List of code libraries needed |
| `vite.config.js` | Build tool settings |
| `tailwind.config.js` | Styling system config |
| `postcss.config.js` | Styling helper config |
| `README.md` | The instruction file |
| `.gitignore` | Tells Git which files to skip |
| `src` folder | Contains the actual app code |
| `public` folder | Contains the app icon |

> **iPad tip:** If you can't select multiple files at once, upload them one at a time. Or upload the folders first, then the loose files. The end result has to match the same structure as your unzipped folder.

7. Scroll to the bottom. Where it says **"Commit changes"**, type `first commit` in the message box
8. Tap the green **Commit changes** button

✅ **You should now see:** A list of all your uploaded files showing on the GitHub repo page. You should see `index.html`, `package.json`, `src/`, `public/`, etc.

> **If folders are missing:** Open the missing folder on iPad, repeat the upload process, but this time when you create the file in GitHub, type the folder name followed by `/` (like `src/main.jsx`) — GitHub auto-creates the folder.

---

## STEP 4 — Deploy to Vercel

**What this does:** Vercel takes your GitHub code and turns it into a live website.

1. In Safari, go to **vercel.com** and make sure you're signed in (use "Continue with GitHub")
2. Tap **Add New** → **Project**
3. You'll see a list of your GitHub repos. Find `maximize` and tap **Import**
4. Vercel auto-detects everything. You should see "Framework Preset: Vite"
5. **Don't change anything.** Just tap **Deploy**
6. Wait about 60–90 seconds. You'll see build logs scrolling.

✅ **You should now see:** A success screen with confetti and a URL like `maximize-abc123.vercel.app`. Tap the URL or the screenshot — Maximize is now live on the internet!

---

## STEP 5 — Add Maximize to your iPad home screen

**What this does:** Creates an icon on your iPad home screen that opens Maximize full-screen, with no Safari bars, no Claude, nothing else. It will look and behave like a real app.

1. Open your Vercel URL in **Safari** on the iPad (must be Safari, not Chrome)
2. Tap the **Share** button (square with an up arrow, in the top right toolbar)
3. Scroll down in the share sheet — tap **Add to Home Screen**
4. You'll see "Maximize" as the name with the sunburst icon. Tap **Add** in the top right.

✅ **You should now see:** A Maximize icon on your iPad home screen. Tap it — it opens **full screen, no browser bars, no Claude**. It is now, functionally, your app.

---

## You're done!

Maximize is:
- ✅ Live on the internet at your Vercel URL
- ✅ Installed on your iPad home screen like a real app
- ✅ Free to host forever
- ✅ Shareable — send the URL to anyone, they can use it too

---

## Common iPad issues & fixes

**"I can't find the zip file after downloading"**
→ Open Files app → tap **Browse** (bottom) → look in **Downloads** under **On My iPad** or **iCloud Drive**.

**"GitHub won't let me upload a folder"**
→ Upload the files individually. When creating a file, type `src/main.jsx` as the filename — GitHub will create the `src` folder automatically.

**"Vercel build failed"**
→ Open your GitHub repo and check that `package.json` is in the **root** (not inside a folder). If you accidentally uploaded the entire `maximize-deploy` folder as a subfolder, delete the repo and start over, making sure to upload the files *inside* the folder, not the folder itself.

**"My app icon is blank/generic"**
→ Make sure `icon.svg` is in the `public` folder of your repo. If it's not there, re-upload it.

**"It opens in Safari with bars instead of full screen"**
→ You added it through Chrome or another browser. Only **Safari** gives you the full-screen app behavior on iOS.

---

## Making updates later (also from iPad)

When you want to change something (new lesson, fix typo, etc.):

1. Open your repo on **github.com** in Safari
2. Navigate to the file you want to edit (probably `src/MaximizeApp.jsx`)
3. Tap the **pencil icon** to edit it
4. Make your changes, then scroll down and tap **Commit changes**
5. Vercel will detect the change and auto-redeploy in about 60 seconds
6. Refresh your home screen app — the update is live

For real serious editing on iPad, look into apps like **Working Copy** (Git client) and **Textastic** (code editor). But for small tweaks, GitHub's web editor in Safari works fine.

---

## What's next

You now have a working product live on the internet. Things to consider:

1. **Get a custom domain** like `getmaximize.com` (~$10/year from Namecheap). Add it in Vercel under Settings → Domains.
2. **Add a database** so user progress actually saves between sessions. Vercel has Postgres built in, or use Supabase (free tier).
3. **Wire up real AI lessons** using Anthropic's Claude API to generate custom content from class materials.
4. **Get feedback from real students** before adding more features. Share the URL with friends at Wake Forest.

Ship it now. Add the rest when you know what people actually need.
