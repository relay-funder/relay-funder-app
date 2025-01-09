import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Campaign" ADD COLUMN IF NOT EXISTS "location" TEXT;`
    )
    console.log('Successfully added location column')
  } catch (error) {
    console.error('Error adding location column:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 