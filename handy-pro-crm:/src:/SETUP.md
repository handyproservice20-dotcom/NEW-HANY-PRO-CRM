# Handy Pro CRM — Setup Guide

## Step 1: Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and log in
2. Click **New Project** — give it a name like "handy-pro-crm"
3. Once the project loads, go to **SQL Editor** (left sidebar)
4. Click **New Query**, paste the entire contents of `supabase-setup.sql`, click **Run**
5. Go to **Settings → API** (left sidebar)
6. Copy your **Project URL** and **anon public** key

## Step 2: Add Your Keys to the App

Open `src/supabaseClient.js` and replace the placeholders:

```js
const supabaseUrl = 'https://xxxxxxxxxxxx.supabase.co'   // your Project URL
const supabaseAnonKey = 'eyJhbGc...'                      // your anon key
```

## Step 3: Set Your GitHub Repo Name

Open `vite.config.js` and change `/handy-pro-crm/` to match your GitHub repo name:

```js
base: '/your-repo-name/',   // must match exactly
```

## Step 4: Create Employee Accounts

In Supabase → **Authentication → Users → Invite user**
Add an email for each employee. They'll get an email to set their password.

## Step 5: Build and Deploy to GitHub Pages

```bash
npm install
npm run build
```

This creates a `dist/` folder. Push the contents of `dist/` to your repo's `gh-pages` branch,
or use the GitHub Actions workflow below.

### Easy Deploy with GitHub Actions

Create `.github/workflows/deploy.yml` in your repo:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

Then push to `main` and GitHub will auto-build and deploy.
Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch.

Your app will be live at: `https://yourusername.github.io/your-repo-name/`
