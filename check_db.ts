// Run with: npx tsx check_db.ts
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  connectionLimit: 10,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  try {
    const count = await prisma.password_reset_token.count();
    console.log("Table password_reset_token exists. Count:", count);
  } catch (e) {
    console.error("Error accessing password_reset_token:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
