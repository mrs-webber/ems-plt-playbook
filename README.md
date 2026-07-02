# EMS PLT Playbook

A resource website that helps Professional Learning Teams (PLTs) move from
**PLC Lite** to **PLC Right** — a step-by-step guide, a yearlong sequence of 18
meeting agendas, and the reproducibles teams need, all organized in one place.

Built with [Astro](https://astro.build) + [Tailwind CSS](https://tailwindcss.com),
TypeScript, and Markdown content. It builds to static files for hosting on
Amazon S3 + CloudFront.

---

## Run it locally

You need [Node.js](https://nodejs.org) 18+ (this project was built on Node 20+).

```bash
npm install        # first time only
npm run dev        # start the local dev server
```

Then open the URL it prints (usually **http://localhost:4321**). The page
reloads automatically as you edit files.

Other commands:

```bash
npm run build      # build the static site into dist/
npm run preview    # serve the built dist/ locally, exactly as it will deploy
npm run check      # type-check the project
```

---

## Where the content lives (edit these — no coding required)

All the teacher-facing content is plain Markdown and JSON. Edit these and the
site updates:

| What | Where |
| --- | --- |
| The 18 meeting agendas | `src/content/meetings/meeting-01.md` … `meeting-18.md` |
| The 9-step guide + EMS templates | `src/content/guide/step-1-*.md` … `step-9-*.md` |
| The reproducibles / resource list | `src/data/resources.json` |
| School name, district, colors, nav | `src/config.ts` and `src/styles/global.css` |

### Editing a meeting

Each meeting file has a top section (between the `---` lines) with its number,
title, focus, product, and which resources it uses, followed by the agenda and
"why it matters" written in Markdown. Change the text, save, and the page
updates.

### Rebranding

- **School / district name and tagline:** `src/config.ts`
- **Colors:** edit the `--color-brand-*` and `--color-accent-*` values at the top
  of `src/styles/global.css`. They flow through the entire site.
- **Logo:** replace `public/favicon.svg`, and swap the `PLT` badge in
  `src/components/Header.astro` for an `<img>` if you have a logo file.

---

## Project structure

```
src/
  components/     reusable UI (header, footer, cards, etc.)
  content/        Markdown content
    meetings/     the 18 meeting agendas
    guide/        the 9 guide steps
  data/
    resources.json  the reproducibles list
  layouts/        the base page shell
  pages/          routes (home, /guide, /meetings, /resources, /process)
  config.ts       site name, nav, the four critical questions
  content.config.ts  content schemas
  styles/global.css  design tokens + typography
public/           static files served as-is (favicon, etc.)
infra/            CloudFront directory-index function
.github/workflows/deploy.yml   CI/CD to S3 + CloudFront
```

---

## Deploying

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full S3 + CloudFront + GitHub Actions
setup. Short version: set three repo *variables* (`AWS_REGION`, `S3_BUCKET`,
`CLOUDFRONT_DISTRIBUTION_ID`) and one *secret* (`AWS_ROLE_ARN`), then push to
`main`.

---

## A note on reproducibles

Official reproducibles are hosted by Solution Tree, whose free reproducibles may
be copied and distributed within teams, schools, and districts. Most resource
cards link **directly to the official PDF** and note the source book; a few
without a public direct link point to the book's resource page instead. The
**EMS-created templates** in the Guide are editable equivalents inspired by the
PLC at Work process — not copies of copyrighted forms.

## License

The site's own code and EMS-created content are licensed under the
[Apache License 2.0](LICENSE). This does not extend to third-party materials
(such as Solution Tree reproducibles), which remain under their respective
owners' terms.
