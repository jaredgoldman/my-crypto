import { prismaCli } from '../src/config/db'
const cleanDb = async () => {
  try {
    await prismaCli.userExchangeKey.deleteMany({})
    await prismaCli.userExchange.deleteMany({})
    await prismaCli.exchange.deleteMany({})
    await prismaCli.user.deleteMany({})
  } catch (error) {
    console.log(error)
  }
}

cleanDb()
