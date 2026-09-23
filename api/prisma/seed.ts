import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';
import { SKILLS } from '../src/users/constants/skills.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const HR_EMAIL = 'alexander@systems.internal';
const CANDIDATE_EMAIL = 'jordan@candidates.internal';
const SEED_PASSWORD = 'password123';

async function main() {
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  const hr = await prisma.user.upsert({
    where: { email: HR_EMAIL },
    update: { role: 'HR', firstName: 'Alexander', lastName: 'Systems' },
    create: {
      email: HR_EMAIL,
      passwordHash,
      role: 'HR',
      firstName: 'Alexander',
      lastName: 'Systems',
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: CANDIDATE_EMAIL },
    update: {},
    create: {
      email: CANDIDATE_EMAIL,
      passwordHash,
      role: 'CANDIDATE',
      firstName: 'Jordan',
      lastName: 'Candidate',
      candidateProfile: {
        create: {
          currentRole: 'Software Engineer',
          yearsExperience: 4,
          targetRole: 'Senior Software Engineer',
          skills: [SKILLS[0], SKILLS[1], SKILLS[13], SKILLS[25]],
        },
      },
    },
  });

  console.log(`Seeded HR user ${hr.email} (password: ${SEED_PASSWORD})`);
  console.log(
    `Seeded CANDIDATE user ${candidate.email} (password: ${SEED_PASSWORD})`,
  );
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
