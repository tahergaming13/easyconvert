---
description: Walk through the Vercel deployment checklist for this static site.
agent: build
---

Help deploy EasyConvert to Vercel free tier:

1. First run `npm run build` and make sure it passes. Fix any errors before continuing.
2. Confirm `git status` is clean (or tell the user what still needs committing/pushing).
3. Remind them of the Vercel settings: Framework **Vite**, Build command `npm run build`, Output directory `dist`, no env vars needed.
4. If the Vercel CLI is available, offer to run `npx vercel --prod`; otherwise give the dashboard steps (Import repo → configure → Deploy).

Extra context from the user: $ARGUMENTS
