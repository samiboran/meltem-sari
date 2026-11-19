# Meltem Sarı — Photography Portfolio

React + Vite site, hosted on GitHub Pages. **No CMS, no admin panel:** all content is
in `src/content/content.json` and all photos are in `public/media/`.

## How the content got here

The site used to read from a Sanity project. The **Snapshot content from Sanity**
workflow (Actions tab → Run workflow) copied every text and photo into this repo
one time. After that, Sanity is not needed. Re-running it only overwrites what is
in this repo with the latest content from Sanity (while that project still exists).

## Editing content

- Text: edit `src/content/content.json` (on GitHub: open the file → pencil icon).
- New photo: upload to `public/media/`, then point to it in `content.json`.
- Intro video: `public/Japan-1.mp4`.
- Contact info: `src/pages/Contact.jsx`.

Each push to `main` rebuilds and publishes the site automatically.

## Domain (meltemsari.com)

1. Add a file `public/CNAME` containing just `meltemsari.com`.
2. At the domain registrar, point the DNS to GitHub Pages:
   - `A` records for `@`: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
   - `CNAME` record `www` → `samiboran.github.io`
3. Settings → Pages → Custom domain: `meltemsari.com`, then tick "Enforce HTTPS".

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run snapshot   # re-copy content from Sanity
```
