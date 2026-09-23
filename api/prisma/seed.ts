import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { SKILLS } from '../src/users/constants/skills.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_PASSWORD = 'password123';

// Relative to "now" so a demo deploy always looks recent, whenever it runs.
function daysFromNow(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

const HR = { email: 'alexander@systems.internal', firstName: 'Alexander', lastName: 'Systems' };

const CANDIDATES = [
  {
    email: 'jordan@candidates.internal',
    firstName: 'Jordan',
    lastName: 'Candidate',
    currentRole: 'Software Engineer',
    yearsExperience: 4,
    targetRole: 'Senior Software Engineer',
    skills: [SKILLS[0], SKILLS[1], SKILLS[13], SKILLS[25]],
  },
  {
    email: 'priya@candidates.internal',
    firstName: 'Priya',
    lastName: 'Patel',
    currentRole: 'Frontend Developer',
    yearsExperience: 3,
    targetRole: 'Senior Frontend Developer',
    skills: [SKILLS[0], SKILLS[13], SKILLS[14]],
  },
  {
    email: 'sam@candidates.internal',
    firstName: 'Sam',
    lastName: 'Rivera',
    currentRole: 'Backend Developer',
    yearsExperience: 6,
    targetRole: 'Staff Backend Engineer',
    skills: [SKILLS[1], SKILLS[16], SKILLS[17], SKILLS[25]],
  },
  {
    email: 'morgan@candidates.internal',
    firstName: 'Morgan',
    lastName: 'Lee',
    currentRole: 'Product Designer',
    yearsExperience: 2,
    targetRole: 'Senior Product Designer',
    skills: [SKILLS[13]],
  },
  {
    email: 'casey@candidates.internal',
    firstName: 'Casey',
    lastName: 'Kim',
    currentRole: 'DevOps Engineer',
    yearsExperience: 5,
    targetRole: 'Senior DevOps Engineer',
    skills: [SKILLS[29], SKILLS[30], SKILLS[31]],
  },
] as const;

// Deterministic ids so this whole block is safe to re-run (upsert, not create).
const SESSIONS = [
  {
    id: 'seed-session-jordan-technical',
    candidate: 'jordan@candidates.internal',
    type: 'TECHNICAL',
    status: 'COMPLETED',
    position: 'Senior Software Engineer',
    scheduledAt: daysFromNow(-75),
    feedback: { id: 'seed-feedback-jordan-technical', rating: 8, recommendation: 'HIRE', isPublished: true },
  },
  {
    id: 'seed-session-jordan-system-design',
    candidate: 'jordan@candidates.internal',
    type: 'SYSTEM_DESIGN',
    status: 'COMPLETED',
    position: 'Senior Software Engineer',
    scheduledAt: daysFromNow(-49),
    feedback: { id: 'seed-feedback-jordan-system-design', rating: 9, recommendation: 'HIRE', isPublished: true },
  },
  {
    id: 'seed-session-jordan-case-study',
    candidate: 'jordan@candidates.internal',
    type: 'CASE_STUDY',
    status: 'SCHEDULED',
    position: 'Senior Software Engineer',
    scheduledAt: daysFromNow(7),
  },
  {
    id: 'seed-session-priya-technical',
    candidate: 'priya@candidates.internal',
    type: 'TECHNICAL',
    status: 'COMPLETED',
    position: 'Senior Frontend Developer',
    scheduledAt: daysFromNow(-70),
    feedback: { id: 'seed-feedback-priya-technical', rating: 6, recommendation: 'MAYBE', isPublished: true },
  },
  {
    id: 'seed-session-priya-behavioral',
    candidate: 'priya@candidates.internal',
    type: 'BEHAVIORAL',
    status: 'COMPLETED',
    position: 'Senior Frontend Developer',
    scheduledAt: daysFromNow(-34),
    feedback: { id: 'seed-feedback-priya-behavioral', rating: 7, recommendation: 'HIRE', isPublished: true },
  },
  {
    id: 'seed-session-priya-culture-fit',
    candidate: 'priya@candidates.internal',
    type: 'CULTURE_FIT',
    status: 'SCHEDULED',
    position: 'Senior Frontend Developer',
    scheduledAt: daysFromNow(12),
  },
  {
    id: 'seed-session-sam-technical',
    candidate: 'sam@candidates.internal',
    type: 'TECHNICAL',
    status: 'COMPLETED',
    position: 'Staff Backend Engineer',
    scheduledAt: daysFromNow(-89),
    feedback: { id: 'seed-feedback-sam-technical', rating: 4, recommendation: 'NO_HIRE', isPublished: true },
  },
  {
    id: 'seed-session-sam-case-study',
    candidate: 'sam@candidates.internal',
    type: 'CASE_STUDY',
    status: 'COMPLETED',
    position: 'Staff Backend Engineer',
    scheduledAt: daysFromNow(-42),
    feedback: { id: 'seed-feedback-sam-case-study', rating: 8, recommendation: 'HIRE', isPublished: false },
  },
  {
    id: 'seed-session-sam-behavioral',
    candidate: 'sam@candidates.internal',
    type: 'BEHAVIORAL',
    status: 'CANCELLED',
    position: 'Staff Backend Engineer',
    scheduledAt: daysFromNow(-53),
  },
  {
    id: 'seed-session-morgan-culture-fit',
    candidate: 'morgan@candidates.internal',
    type: 'CULTURE_FIT',
    status: 'COMPLETED',
    position: 'Senior Product Designer',
    scheduledAt: daysFromNow(-22),
    feedback: { id: 'seed-feedback-morgan-culture-fit', rating: 7, recommendation: 'MAYBE', isPublished: true },
  },
  {
    id: 'seed-session-morgan-behavioral',
    candidate: 'morgan@candidates.internal',
    type: 'BEHAVIORAL',
    status: 'COMPLETED',
    position: 'Senior Product Designer',
    scheduledAt: daysFromNow(-13),
    feedback: { id: 'seed-feedback-morgan-behavioral', rating: 9, recommendation: 'HIRE', isPublished: true },
  },
  {
    id: 'seed-session-casey-technical',
    candidate: 'casey@candidates.internal',
    type: 'TECHNICAL',
    status: 'COMPLETED',
    position: 'Senior DevOps Engineer',
    scheduledAt: daysFromNow(-8),
    feedback: { id: 'seed-feedback-casey-technical', rating: 5, recommendation: 'NO_HIRE', isPublished: true },
  },
  {
    id: 'seed-session-casey-system-design',
    candidate: 'casey@candidates.internal',
    type: 'SYSTEM_DESIGN',
    status: 'IN_PROGRESS',
    position: 'Senior DevOps Engineer',
    scheduledAt: daysFromNow(0),
  },
] as const;

const FEEDBACK_TEXT: Record<string, { comments: string; strengths: string; improvementAreas: string }> = {
  HIRE: {
    comments: 'Strong performance across the board, clear communicator, solved problems methodically.',
    strengths: 'Deep technical knowledge; asks clarifying questions; handles ambiguity well.',
    improvementAreas: 'Could be more concise when explaining trade-offs.',
  },
  MAYBE: {
    comments: 'Solid fundamentals but a few gaps surfaced under pressure.',
    strengths: 'Good communication; collaborative approach to problem-solving.',
    improvementAreas: 'Needs more depth on system design trade-offs; hesitant on edge cases.',
  },
  NO_HIRE: {
    comments: 'Struggled to work through the core problem even with hints.',
    strengths: 'Personable and easy to talk to.',
    improvementAreas: 'Fundamentals need work; struggled to debug their own approach.',
  },
};

async function main() {
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  const hr = await prisma.user.upsert({
    where: { email: HR.email },
    update: { role: 'HR', firstName: HR.firstName, lastName: HR.lastName },
    create: { email: HR.email, passwordHash, role: 'HR', firstName: HR.firstName, lastName: HR.lastName },
  });
  console.log(`Seeded HR user ${hr.email} (password: ${SEED_PASSWORD})`);

  const candidatesByEmail = new Map<string, { id: string }>();
  for (const c of CANDIDATES) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        passwordHash,
        role: 'CANDIDATE',
        firstName: c.firstName,
        lastName: c.lastName,
        candidateProfile: {
          create: {
            currentRole: c.currentRole,
            yearsExperience: c.yearsExperience,
            targetRole: c.targetRole,
            skills: [...c.skills],
          },
        },
      },
    });
    candidatesByEmail.set(c.email, user);
    console.log(`Seeded CANDIDATE user ${user.email} (password: ${SEED_PASSWORD})`);
  }

  for (const s of SESSIONS) {
    const candidate = candidatesByEmail.get(s.candidate)!;
    await prisma.interviewSession.upsert({
      where: { id: s.id },
      update: {},
      create: {
        id: s.id,
        candidateId: candidate.id,
        interviewerId: hr.id,
        scheduledAt: s.scheduledAt,
        durationMinutes: 60,
        position: s.position,
        type: s.type,
        status: s.status,
      },
    });

    if ('feedback' in s && s.feedback) {
      const text = FEEDBACK_TEXT[s.feedback.recommendation];
      await prisma.feedback.upsert({
        where: { id: s.feedback.id },
        update: {},
        create: {
          id: s.feedback.id,
          sessionId: s.id,
          authorId: hr.id,
          candidateId: candidate.id,
          rating: s.feedback.rating,
          recommendation: s.feedback.recommendation,
          comments: text.comments,
          strengths: text.strengths,
          improvementAreas: text.improvementAreas,
          isPublished: s.feedback.isPublished,
          publishedAt: s.feedback.isPublished ? s.scheduledAt : null,
        },
      });
    }
  }
  console.log(`Seeded ${SESSIONS.length} interview sessions and their feedback.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
