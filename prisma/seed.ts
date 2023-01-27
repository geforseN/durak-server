import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

//main();

async function main() {
  console.log(await prisma.user.findMany());
}
