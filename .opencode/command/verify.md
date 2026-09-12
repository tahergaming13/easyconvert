---
description: Typecheck and build the project, then report any errors.
agent: build
---

Run the full verification for this project and report the result:

1. Run `npm run build` in the project root (this runs `tsc` + `vite build`).
2. If it fails, show the failing errors, fix them, and re-run until green.
3. Summarize: typecheck status, build status, output size of `dist/`, and any warnings worth knowing about (e.g. chunk size).

Extra context from the user: $ARGUMENTS
