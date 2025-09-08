const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkDiscountRules() {
  try {
    const rules = await prisma.discountRule.findMany({
      where: {
        apartmentId: 'cmf4aplby000fujq0r1509971',
        isActive: true
      },
      orderBy: {
        minNights: 'asc'
      }
    })
    
    console.log('Discount Rules for Hearts 5:')
    if (rules.length === 0) {
      console.log('No discount rules found')
    } else {
      rules.forEach(r => {
        console.log(`${r.minNights} nights: ${r.percentage}%`)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDiscountRules()