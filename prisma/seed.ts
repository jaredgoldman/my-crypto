import { Status } from '@prisma/client'
import { prismaCli } from '../src/config/db'
import env from '../src/config/env'
import { UserExchangeService } from '../src/services/UserExchangeService'
import bcrypt from 'bcrypt'
import { Logger } from '../src/config/logger'

const userExchangeService = new UserExchangeService()

async function seed() {
  const exchanges = await prismaCli.exchange.findMany()
  const users = await prismaCli.user.findMany({})
  if (!exchanges.length && !users.length) {
    const exchange = await prismaCli.exchange.create({
      data: {
        displayName: 'Kraken',
        name: 'kraken',
        url: 'https://www.kraken.com',
        image: 'https://www.kraken.com/logo.png',
      },
    })
    const user = await prismaCli.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        status: Status.ACTIVE,
      },
    })
    await prismaCli.userSecret.create({
      data: {
        secret: bcrypt.hashSync('test', 10),
        userId: user.id,
      },
    })
    await userExchangeService.create(
      user.id,
      exchange.id,
      env.TEST_API_KEY,
      env.TEST_API_SECRET
    )
  }
  Logger.info('Database seeding complete')
}

seed()
  .then(async () => {
    await prismaCli.$disconnect()
  })
  .catch(async e => {
    Logger.error(e)
    await prismaCli.$disconnect()
    process.exit(1)
  })
