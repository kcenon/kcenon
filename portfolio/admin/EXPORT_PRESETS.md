# Export Preset Reference

A quick reference for choosing the right export modal settings depending on the
audience that will receive the resume / portfolio document. Open the admin
page, click **Export → Export Options...**, and apply the preset that matches
your audience.

> The cover-page summary, theme, and section bands are already wired through
> the `executive` theme. The preset choices below are about **what to select
> in the export modal**, not what to change in code.

## Quick reference matrix

| Setting                       | Regulated CTO / Research Director | Enterprise R&D Leader (KOSDAQ / public sector) | Medical-domain CTO       |
|------------------------------|-----------------------------------|------------------------------------------------|---------------------------|
| Theme                        | `executive` (navy + gold)         | `executive`                                    | `executive`               |
| Language                     | match audience                    | **Korean** by default                          | match audience            |
| Sections (top → bottom)      | Expertise → **Manager** → Projects → Career → Education → Testimonials | same                                           | Expertise → Projects → Manager → Career → Education → Testimonials |
| Include cover page           | ✅                                | ✅                                              | ✅                         |
| Include cover letter         | ✅                                | ✅                                              | ✅                         |
| Cover-letter template        | `regulated-cto`                   | `regulated-cto`                                | `medical-cto`             |
| Page break between sections  | ✅                                | ✅                                              | ✅                         |
| File name (auto-localized)   | `portfolio_ko.pdf` / `portfolio_en.pdf` | same                                       | same                      |

## Recommended preset — Enterprise R&D Leader (KOSDAQ / public sector)

This is the right preset when a Korean listed-company executive or insider
asks for the resume to evaluate you for a research-director / R&D head role
across diverse business units (e.g. AI, regulated sectors, industrial robotics,
pharmaceuticals).

| Setting                       | Value                                                                 |
|------------------------------|-----------------------------------------------------------------------|
| Theme                        | `executive`                                                           |
| Language                     | `ko` (한국어)                                                          |
| Section order                | `expertise → manager → projects → career → education → testimonials`  |
| Cover page                   | on — author rendered as `신동철`                                       |
| Cover letter                 | on — template `regulated-cto`                                         |
| Page break between sections  | on                                                                    |

**Why this order matters**

- `expertise` first: the regulated-SDLC + standards engineering story is what
  positions you as domain-neutral. It establishes the meta-skill before any
  specific domain narrative.
- `manager` second: R&D leadership and PM capabilities (team-size range, IPOs,
  cert-success rate) are what KOSDAQ executives evaluate first. Pulling them
  to the second section means the second page already shows leadership weight.
- `projects` third: depth proof of leadership claims, with the category
  page-breaks letting the reader scan medical / industrial / enterprise /
  open-source as discrete blocks.
- `career` fourth: chronological context after impact — by the time the reader
  reaches the timeline they already know what you can do.
- `education` fifth: degree credentials sit after work history per
  international executive-CV norms (HBS Alumni / Microsoft Word resume guide).
  For senior candidates, education is verification context, not a hook.
- `testimonials` last: external validation closes the document.

**Cover letter — `regulated-cto`**

The `regulated-cto` template is the domain-neutral cover letter authored
during the rebrand session. It opens with *"표준이라는 제약 위에서 엄정한
엔지니어링 조직을 만들어 가는"* and ends with the ISO/IEC 표준 이전성
narrative — the right tone for an executive evaluator who cares about
transferable regulated-SDLC leadership rather than a specific domain.

## How to apply the preset

1. Open `admin.html` in the browser.
2. Click **Export ▾** in the header → **Export Options...**.
3. Set the modal fields per the table above.
4. Verify **Theme** = `Executive`, **Language** = `한국어`.
5. The section-order chips are draggable — reorder so **Manager** is the
   second item.
6. Tick **Include cover page** and **Include cover letter**, then pick the
   `regulated-cto` template from the cover-letter dropdown (the cover-letter
   tab on the admin sidebar is where the default selection is persisted).
7. Click **Export PDF** (or **Export Word**). The output filename includes
   the language suffix (`portfolio_ko.pdf`).

## Cover-page summary content (current copy)

The cover page renders three lines in either language. The Korean copy is
tuned for KOSDAQ-listed-company evaluators who weigh IPO contribution and
multi-domain transferability:

```
안전 중요·ISO 인증 도메인에서 R&D 조직과 플랫폼을 20년 넘게 이끌어 왔습니다.
2회 IPO 기여, 4개국 글로벌 인증 통과, 3–11명 다언어 R&D 팀 리딩 경험.
규제 SDLC 메타-역량을 의료·자동차·항공·산업 안전 표준으로 이전한 경험.
```

To change the wording, edit `summaryLines` inside `buildCoverPage` in both
`admin/utils/pdf-exporter.js` and `admin/utils/docx-exporter.js` (they are
intentionally duplicated — same copy must live in both exporters).

## Variations

- **Bilingual submission**: produce both `portfolio_ko.pdf` and
  `portfolio_en.pdf` and submit them together. The English copy is a useful
  fallback when an evaluator forwards the resume to an international peer or
  partner.
- **Heavily medical-domain audience**: switch to the `medical-cto` cover
  letter and reorder sections to `expertise → projects → manager → career →
  education → testimonials` so DICOM / PACS / orthodontic project depth
  surfaces earlier.
- **Blind / first-pass screening**: leave **Include personal information**
  off (default). Recruiters who run anonymized first-rounds can score the
  candidate without contact metadata leaking into the cover page; toggle it
  on once the submission turns named.
- **AI-heavy audience without LLM hands-on background**: keep the
  `regulated-cto` cover letter but in the cover-letter editor adjust the
  closing paragraph to acknowledge the AI/LLM stack as a complementary
  learning track on top of the regulated-SDLC and infrastructure foundation.
