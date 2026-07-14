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
  { label: 'Printable Guide', href: '/print/' },
];

/**
 * Suggested meeting dates for the 2026–27 cycle (meeting number → ISO date).
 * Every other Wednesday, with breaks around the holidays. Edit these to
 * reschedule — dates flow to the meeting pages and the printable guide.
 */
export const meetingSchedule: Record<number, string> = {
  1: '2026-08-12',
  2: '2026-08-26',
  3: '2026-09-09',
  4: '2026-09-23',
  5: '2026-10-07',
  6: '2026-10-21',
  7: '2026-11-04',
  8: '2026-11-18',
  9: '2026-12-02',
  10: '2027-01-13',
  11: '2027-02-03',
  12: '2027-02-17',
  13: '2027-03-03',
  14: '2027-03-17',
  15: '2027-04-07',
  16: '2027-04-21',
  17: '2027-05-05',
  18: '2027-05-19',
};

/**
 * Format a meeting's date for display, e.g. "Wed, Aug 12, 2026".
 * Parses the ISO string as a local date (no timezone shift) and returns an
 * empty string if the meeting has no scheduled date.
 * @param n Meeting number, or an ISO 'YYYY-MM-DD' string.
 */
export function formatMeetingDate(
  n: number | string,
  opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const iso = typeof n === 'number' ? meetingSchedule[n] : n;
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', opts);
}

/** The four critical questions of a PLC — referenced across the site. */
export const criticalQuestions = [
  'What do we want students to learn?',
  'How will we know if they have learned it?',
  'How will we respond when they don’t learn it?',
  'How will we extend the learning for students who are already proficient?',
];
