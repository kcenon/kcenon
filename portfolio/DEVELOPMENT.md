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

## Profile and project content

Keep `README.md` and `README.ko.md` aligned: the same current role, company-specific
experience, links, and scope of standards experience. Summarize experience with
its company context and link to the complete career history. Project discovery
uses the profile's pinned repositories and the portfolio catalog. Do not turn
standards experience into a count of personal certificates.

The public project catalog stays in `data/projects.json` under `openSource`.
Each entry has a bilingual `group`, `description`, and `status`, a repository
`github` URL, a `reviewedAt` date, and `sources` with bilingual labels and file
URLs. Every entry also has bilingual `expanded.features` bullets summarizing the
project before its documentation links; links alone are not a detail summary.
List published-release and development-branch capabilities separately when
necessary. Avoid fixed repository/star totals and unconditional benchmark figures.
A project may be absent from this selected catalog without being archived.

The website groups entries by `group`; `ExportContent.getProjectContext` supplies
the support notes and links to the PDF/DOCX IR and the document preview. Project
preview content also comes from the IR, so catalog entries are not truncated.
Career metrics for export covers live in `data/profile.json`; the same values
must appear in the website hero and the leadership data.

Run these checks before publishing:

```sh
python3 tools/check-profile.py
sh tools/check-cache-versions.sh
node tools/check-exports.mjs
```

`python3 tools/check-profile.py --remote` additionally checks repository visibility,
archive flags, source branches, and file responses, including error text returned
inside SVG images. It checks catalog and README source/image links; it does not
verify every external career claim or social link. An optional `GITHUB_TOKEN`
raises the GitHub API rate limit. The token is sent only to `api.github.com`.

The Profile validation workflow runs local checks and builds both export formats
in both languages on PRs and main pushes. Weekly and manual runs also check the
remote sources; they report drift without rewriting biographical content.

For content changes, generate snapshots before and after with
`tools/export-snapshot.mjs`, using directories outside the checkout. Inspect the
expected content differences and open actual PDF/DOCX outputs; snapshot checks
do not verify fonts or pagination. Check Korean/English, mobile/desktop, and dark
mode in a browser. Export snapshot artifacts must not be committed to the public
Pages tree. The original scripts in `tools/` are covered by `tools/LICENSE` only.
