import 'dotenv/config'
import { randomUUID } from 'crypto'
import { prisma } from '../src/lib/prisma'

async function run() {
  const usuarios = await prisma.usuario.findMany({
    where: { uuid: null },
    select: { id: true },
  })

  console.log(`Usuários sem UUID: ${usuarios.length}`)

  for (const u of usuarios) {
    await prisma.usuario.update({
      where: { id: u.id },
      data: { uuid: randomUUID() },
    })
  }

  console.log('UUIDs de usuario preenchidos')
}
run()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
