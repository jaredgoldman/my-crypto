import { prismaCli } from './config/db'
import { Logger, initLog } from './config/logger'
import { app } from './app'
import env from './config/env'

async function main() {
  await prismaCli.$connect()
}

const startServer = async () => {
  return main()
    .then(async () => {
      initLog()
      app.listen(env.port, () =>
        Logger.info(`my-crypto running at http://localhost:${env.port}`)
      )
    })
    .catch(e => {
      Logger.error(e)
      return process.exit(1)
    })
    .finally(async () => {
      await prismaCli.$disconnect()
    })
}

startServer()
