# EMS PLT Playbook — Claude Code Guide

## What this project is

A static Astro site (Astro + Tailwind v4) serving as a yearlong PLC meeting
playbook for Elsinore Middle School. Content lives in `src/content/` (Markdown
content collections) and `src/data/resources.json`. No backend.

---

## Local development

```bash
npm install    # first time
npm run dev    # dev server at http://localhost:4321
npm run build  # static build → dist/
npm run check  # TypeScript + Astro type-check
```

**Node 20+** required (the GitHub Actions workflow pins Node 20).

---

## Project layout

```
src/
  pages/       Astro pages (index, guide, meetings, resources, process, 404)
  layouts/     BaseLayout.astro — wraps every page
  components/  Header, Footer, PageHeader, FourQuestions, MeetingCard, ResourceCard
  content/     guide/step-*.md (9 steps) · meetings/meeting-*.md (18 meetings)
  data/        resources.json
  styles/      global.css
  config.ts    Site-wide branding (shortName, tagline, nav, criticalQuestions)
infra/
  cloudformation.yaml   All AWS resources (single source of truth)
  cloudfront-index-rewrite.js   Source reference for the CloudFront Function
```

---

## Live deployment

- **Live URL:** https://emsplc.mrswebber.com
- **Stack:** `emsplc-site` in `us-east-1` (CloudFormation)
- **Pipeline:** push to `main` → `.github/workflows/deploy.yml` → build → S3 sync → CloudFront invalidation

No keys needed: the workflow authenticates via OIDC.

### Key resource IDs

| Resource | ID / Value |
|---|---|
| S3 bucket | `emsplc-mrswebber-com` (us-east-1, private) |
| CloudFront distribution ID | `E3HAA5I4NCM7B3` |
| CloudFront domain | `d3t1ehp1u8tqjl.cloudfront.net` |
| ACM cert | `arn:aws:acm:us-east-1:020417111620:certificate/399d75a9-57ef-4e9f-9cb8-edc9eae564e7` |
| Deploy role | `arn:aws:iam::020417111620:role/emsplc-github-deploy` |
| Route53 zone | `mrswebber.com` (`Z00087662BKN37H58E2QA`) |

Full details and security notes: [DEPLOYMENT.md](DEPLOYMENT.md).

---

## Modifying infrastructure

Edit [infra/cloudformation.yaml](infra/cloudformation.yaml), then:

```bash
aws cloudformation deploy \
  --stack-name emsplc-site \
  --region us-east-1 \
  --template-file infra/cloudformation.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

Do **not** change AWS resources through the console — the template is the source
of truth and console changes will be overwritten or cause drift.

---

## Content editing quick reference

- **Add a meeting note:** edit `src/content/meetings/meeting-NN.md`.
- **Edit step content:** edit `src/content/guide/step-N-*.md`.
- **Add a resource:** edit `src/data/resources.json` (schema: `title`, `description`, `url`, `category`).
- **Rebrand:** edit `src/config.ts` (shortName, schoolName, tagline, etc.).
- **Site URL:** `astro.config.mjs` → `site` field.
