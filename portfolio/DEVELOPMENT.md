# Development Notes

Operational rules for maintaining this portfolio. Read before committing.

## Deployment model

GitHub Pages serves the **root of the `main` branch** directly (configured in
GitHub Settings, not in this repo). There is no build step and no deploy
workflow.

Consequence: **every tracked file is a public URL** under
`https://kcenon.github.io/kcenon/`. Never commit internal notes, debug
harnesses, or strategy documents. Local-only material belongs in
`portfolio/data/private/`, which is gitignored (see `portfolio/.gitignore`).

## Cache-buster policy

All local assets are loaded with a `?v=` query, and `portfolio/data/data.js`
fetches JSON with its `DATA_VERSION` constant. These must all carry **one
unified version** — a partial bump leaves returning visitors with a mix of
cached old assets and new ones.

- Bump on **every** change to data (JSON), JS, or CSS:

  ```sh
  tools/bump-version.sh <new-version>   # e.g. tools/bump-version.sh 1.17.0
  ```

  This rewrites every local `?v=` query in `portfolio/index.html` and
  `portfolio/admin.html` plus `DATA_VERSION` in `portfolio/data/data.js`.
  External (schemed) URLs are left untouched.

- Verify consistency before committing:

  ```sh
  tools/check-cache-versions.sh         # exits 1 and lists any mismatch
  ```

## Vendored libraries

Export libraries used by the admin page (pdfmake, docx, FileSaver) are served
locally from `portfolio/admin/vendor/` instead of CDN `<script>` tags. This
removes the third-party runtime dependency (no CDN outage/compromise surface,
no SRI hash maintenance) and works offline. When upgrading a library, replace
the file in `vendor/` and bump the unified version as above.
