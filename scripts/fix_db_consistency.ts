
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Verificando inconsistências em vaga_area...')
  
  // Encontra vaga_ids em vaga_area que não existem em vaga
  const orphans = await prisma.$queryRaw`
    SELECT DISTINCT va.vaga_id 
    FROM vaga_area va 
    LEFT JOIN vaga v ON va.vaga_id = v.id 
    WHERE v.id IS NULL
  ` as any[]

  console.log(`Encontrados ${orphans.length} vaga_ids órfãos.`)

  if (orphans.length > 0) {
    console.log('Removendo registros órfãos...')
    const result = await prisma.$executeRaw`
        DELETE va FROM vaga_area va 
        LEFT JOIN vaga v ON va.vaga_id = v.id 
        WHERE v.id IS NULL
    `
    console.log(`Removidos ${result} registros de vaga_area.`)
  }

  // Limpar vaga_soft_skill
  const orphansSoft = await prisma.$queryRaw`
    SELECT DISTINCT vs.vaga_id 
    FROM vaga_soft_skill vs 
    LEFT JOIN vaga v ON vs.vaga_id = v.id 
    WHERE v.id IS NULL
  ` as any[]

  console.log(`Encontrados ${orphansSoft.length} vaga_ids órfãos em vaga_soft_skill.`)

  if (orphansSoft.length > 0) {
    console.log('Removendo registros órfãos de vaga_soft_skill...')
    const result = await prisma.$executeRaw`
        DELETE vs FROM vaga_soft_skill vs 
        LEFT JOIN vaga v ON vs.vaga_id = v.id 
        WHERE v.id IS NULL
    `
    console.log(`Removidos ${result} registros de vaga_soft_skill.`)
  }

  // Limpar vaga_favorita
  const orphansFav = await prisma.$queryRaw`
    SELECT DISTINCT vf.vaga_id 
    FROM vaga_favorita vf 
    LEFT JOIN vaga v ON vf.vaga_id = v.id 
    WHERE v.id IS NULL
  ` as any[]

  console.log(`Encontrados ${orphansFav.length} vaga_ids órfãos em vaga_favorita.`)

  if (orphansFav.length > 0) {
    console.log('Removendo registros órfãos de vaga_favorita...')
    const result = await prisma.$executeRaw`
        DELETE vf FROM vaga_favorita vf 
        LEFT JOIN vaga v ON vf.vaga_id = v.id 
        WHERE v.id IS NULL
    `
    console.log(`Removidos ${result} registros de vaga_favorita.`)
  }

  console.log('Verificação concluída.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
