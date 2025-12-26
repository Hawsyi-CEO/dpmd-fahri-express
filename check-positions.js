const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPositions() {
  try {
    const positions = await prisma.positions.findMany();
    console.log(JSON.stringify(positions, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPositions();
