import * as argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SEED_EMAIL = 'alexander@systems.internal';
const SEED_PASSWORD = 'password123';

async function main() {
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  const user = await prisma.user.upsert({
    where: { email: SEED_EMAIL },
    update: {},
    create: { email: SEED_EMAIL, passwordHash },
  });

  console.log(`Seeded user ${user.email} (password: ${SEED_PASSWORD})`);
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
