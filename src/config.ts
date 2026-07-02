/**
 * Site-wide branding and config.
 * Edit these values to rebrand the site — they flow through every page.
 */
export const site = {
  /** Short name used in the header/logo. */
  shortName: 'EMS PLT Playbook',
  /** What "EMS" stands for. */
  schoolName: 'Elsinore Middle School',
  /** District name for the footer. */
  districtName: 'Lake Elsinore Unified School District',
  /** Tagline shown in the header and on the home page. */
  tagline: 'Moving from PLC Lite to PLC Right',
  /** Longer description used for SEO / social previews. */
  description:
    'A step-by-step playbook, yearlong meeting agendas, and reproducibles to help EMS Professional Learning Teams shift from PLC Lite to PLC Right — one authentic learning cycle at a time.',
};

/** Primary navigation shown in the header and footer. */
export const nav = [
  { label: 'Home', href: '/' },
  { label: 'The Guide', href: '/guide/' },
  { label: 'The 18 Meetings', href: '/meetings/' },
  { label: 'Resources', href: '/resources/' },
  { label: 'The Process', href: '/process/' },
];

/** The four critical questions of a PLC — referenced across the site. */
export const criticalQuestions = [
  'What do we want students to learn?',
  'How will we know if they have learned it?',
  'How will we respond when they don’t learn it?',
  'How will we extend the learning for students who are already proficient?',
];
