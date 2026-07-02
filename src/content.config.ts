import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* -------------------------------------------------------------------------
   Meetings — the 18 yearlong PLT meeting agendas.
   One Markdown file per meeting in src/content/meetings/.
   ------------------------------------------------------------------------- */
const meetings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/meetings' }),
  schema: z.object({
    number: z.number(),
    title: z.string(),
    focus: z.string(),
    plcQuestion: z.string(),
    // Which of the four critical questions this meeting centers on (1–4).
    criticalQuestions: z.array(z.number()).default([]),
    product: z.string(),
    // Resource slugs (see src/data/resources.json) introduced this meeting.
    resources: z.array(z.string()).default([]),
    // Resource slugs revisited (already introduced in an earlier meeting).
    revisit: z.array(z.string()).default([]),
    // Intentional buffer / reset meeting built in for the culture shift.
    buffer: z.boolean().default(false),
    // Meeting 13 — the turning point from "building clarity" to "PLC right".
    turningPoint: z.boolean().default(false),
  }),
});

/* -------------------------------------------------------------------------
   Guide — the 9-step EMS PLT cycle (the "playbook").
   One Markdown file per step in src/content/guide/.
   ------------------------------------------------------------------------- */
const guide = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guide' }),
  schema: z.object({
    step: z.number(),
    title: z.string(),
    summary: z.string(),
    plcQuestion: z.string().optional(),
    // Name of the EMS-created reproducible template embedded in this step.
    reproducible: z.string().optional(),
  }),
});

/* -------------------------------------------------------------------------
   Resources — the Solution Tree / AllThingsPLC reproducibles + EMS templates.
   Single JSON array in src/data/resources.json.
   ------------------------------------------------------------------------- */
const resources = defineCollection({
  loader: file('./src/data/resources.json'),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    source: z.enum(['Solution Tree', 'AllThingsPLC', 'EMS-created']),
    category: z.string(),
    required: z.boolean().default(false),
    // External hub link, or an internal anchor for EMS-created templates.
    url: z.string(),
    // Human-friendly label for the link button.
    linkLabel: z.string().default('Open resource'),
    // Source book the reproducible is published in (omit for EMS-created).
    book: z.string().optional(),
    // Where in the book (e.g., "Action 3.1", "Chapter 3", "Figure 8.2").
    bookLocation: z.string().optional(),
    description: z.string(),
    howToUse: z.string(),
  }),
});

export const collections = { meetings, guide, resources };
