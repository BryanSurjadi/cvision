import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({
    where: {
      email: 'admin@cvision.com'
    }
  }) 

  if (existing) {
    console.log('User Admin already exists')
    return
  }

  const hashed = await bcrypt.hash('admin123', 12)
  await prisma.user.create({
    data: {
      name: 'CVision Admin',
      email: 'admin@cvision.com',
      password: hashed,
      role: 'admin'
    }
  })
  console.log('User Admin created')
  console.log('Email: admin@cvision.com')
  console.log('Password: admin123')
}


main().catch(console.error).finally(async () => await prisma.$disconnect())