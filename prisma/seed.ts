import 'dotenv/config';

import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL;

if (!connectionString?.trim()) {
  throw new Error('DATABASE_URL is not set');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function isStrongPassword(password: string): boolean {
  const hasMinLength = password.length >= 12;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  return hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
}

async function main(): Promise<void> {
  console.log("Connecting to database...");

  await prisma.$connect();

  console.log("Database connected successfully!");


  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL?.trim();
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD?.trim();

  if (!adminEmail || !adminPassword) {
    throw new Error('Admin credentials are missing in .env');
  }

  if (!isStrongPassword(adminPassword)) {
    throw new Error(
      'DEFAULT_ADMIN_PASSWORD must be at least 12 characters and include uppercase, lowercase, number, and special character',
    );
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user already exists: ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      role: Role.ADMIN,
      isVerified: true,
      isBlocked: false,
    },
  });

  console.log(`Default admin user created: ${adminEmail}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
