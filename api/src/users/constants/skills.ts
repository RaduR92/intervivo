/**
 * Canonical skill list. The frontend keeps its own copy of the same values
 * for the HR-facing multi-select — this is the backend's independent source
 * of truth, so a request from anywhere other than that UI can't smuggle in
 * arbitrary strings. Keeping the two lists in sync is a manual step; see
 * api/README.md.
 */
export const SKILLS = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'Kotlin',
  'Swift',
  'SQL',
  'React',
  'Angular',
  'Vue',
  'Node.js',
  'NestJS',
  'Express',
  'Spring',
  'Django',
  'Flask',
  '.NET',
  'GraphQL',
  'REST APIs',
  'PostgreSQL',
  'MySQL',
  'MongoDB',
  'Redis',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'CI/CD',
  'Terraform',
  'Git',
  'Testing/QA',
  'System Design',
  'Data Structures & Algorithms',
  'Agile/Scrum',
] as const;

export type Skill = (typeof SKILLS)[number];

export function isSkill(value: string): value is Skill {
  return (SKILLS as readonly string[]).includes(value);
}
