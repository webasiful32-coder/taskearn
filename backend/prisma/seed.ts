import bcrypt from 'bcryptjs';

// Seed file for Neon PostgreSQL via Prisma
export async function seedPrisma(prisma: any) {
  console.log('Seeding Neon PostgreSQL database...');

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskearn.com' },
    update: {},
    create: {
      email: 'admin@taskearn.com',
      passwordHash,
      name: 'System Admin',
      role: 'ADMIN',
      status: 'ACTIVE',
      referralCode: 'ADMIN01',
      balance: 500.0,
      totalEarned: 1250.0,
    },
  });

  // 2. Create Task Creator
  const creator = await prisma.user.upsert({
    where: { email: 'creator@taskearn.com' },
    update: {},
    create: {
      email: 'creator@taskearn.com',
      passwordHash,
      name: 'Acme Digital Media',
      role: 'CREATOR',
      status: 'ACTIVE',
      referralCode: 'ACME2026',
      balance: 350.0,
      totalEarned: 0.0,
    },
  });

  // 3. Create Workers
  const worker1 = await prisma.user.upsert({
    where: { email: 'worker@taskearn.com' },
    update: {},
    create: {
      email: 'worker@taskearn.com',
      passwordHash,
      name: 'Alex Rivera',
      role: 'USER',
      status: 'ACTIVE',
      referralCode: 'ALEX99',
      balance: 42.50,
      pendingEarnings: 6.25,
      totalEarned: 185.00,
      totalWithdrawn: 140.00,
      referredById: admin.id,
    },
  });

  console.log('Database seeded successfully.');
}
