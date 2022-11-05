import { prismaCli } from './config/db'
import { app } from './app'
import env from './config/env'

async function main() {
  await prismaCli.$connect()
}

const startServer = async () => {
  return main()
    .then(async () => {
      console.log('Database connection has been established successfully.')
      app.listen(env.port, () =>
        console.log(`Bitbuy Stocks API listening at http://localhost:${env.port}`)
      )
    })
    .catch(e => {
      console.error(e)
      return process.exit(1)
    })
    .finally(async () => {
      await prismaCli.$disconnect()
    })
}

startServer()
