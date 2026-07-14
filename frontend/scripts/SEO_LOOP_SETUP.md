# SEO Loop — one-time setup

This connects `npm run seo:loop` to your real Google Search Console data so the
loop has something to verify against.

## 1. Create a Google Cloud service account

1. Go to https://console.cloud.google.com/ and create a project (or reuse an existing one) — name it e.g. "stepkai-seo".
2. In the search bar, go to **APIs & Services → Library**, search for **"Google Search Console API"**, click it, click **Enable**.
3. Go to **APIs & Services → Credentials → Create Credentials → Service account**.
   - Name it e.g. `stepkai-seo-reader`.
   - Skip granting it any project-level role (not needed).
4. Click into the service account you just created → **Keys** tab → **Add key → Create new key → JSON**.
   - This downloads a `.json` file. This is your only copy — keep it safe.
5. Copy that file to `frontend/gsc-service-account.json` in this repo.
   - This path is already in `.gitignore` — it will never be committed.

## 2. Give the service account access to your Search Console property

1. Open the downloaded JSON file and copy the `client_email` value — it looks like
   `stepkai-seo-reader@stepkai-seo.iam.gserviceaccount.com`.
2. Go to https://search.google.com/search-console → select the `stepkai.com` property.
3. **Settings → Users and permissions → Add user**.
4. Paste the service account email, set permission to **Restricted** (read-only — that's all this script needs).
5. Save.

## 3. Install the one new dependency

```
cd frontend
npm install --save-dev google-auth-library
```

## 4. Run it

```
npm run seo:loop
```

First run needs `frontend/build/sitemap.xml` to exist for the "zero impressions"
section to work — run `npm run build` first if you haven't recently.

Output is printed to the console and saved to `frontend/seo-reports/YYYY-MM-DD.md`
(also gitignored — these are working notes, not something to commit).

## Notes

- Search Console data has a 2-3 day reporting delay, and this checks data with
  no minimum-traffic threshold — early on (low traffic), most sections may say
  "None found in this window." That's expected, not broken.
- Property must be added as `sc-domain:stepkai.com` (domain property) — if you
  set up Search Console as a URL-prefix property instead
  (`https://www.stepkai.com/`), set `GSC_SITE_URL=https://www.stepkai.com/`
  as an env var when running the script.
