// Quick script to check users table schema
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.$queryRaw`DESCRIBE users`;
  console.log('=== USERS TABLE SCHEMA ===');
  result.forEach(row => {
    console.log(`${row.Field.padEnd(20)} | ${row.Type.padEnd(30)} | Null: ${row.Null} | Key: ${row.Key} | Default: ${row.Default}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
