import { prismaCli } from '../src/config/db'
import { Logger } from '../src/config/logger'
import { v4 as uuid } from 'uuid'

async function seed() {
  const exchanges = await prismaCli.exchange.findMany()
  if (exchanges.length === 0) {
    await prismaCli.exchange.createMany({
      data: [
        {
          displayName: 'Binance',
          name: 'binance',
          url: 'https://www.binance.com/',
          image: 'https://www.binance.com/resources/img/favicon.ico',
        },
        {
          displayName: 'Kraken',
          name: 'kraken',
          url: 'https://www.kraken.com',
          image: 'https://www.kraken.com/logo.png',
        },
      ],
    })
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
