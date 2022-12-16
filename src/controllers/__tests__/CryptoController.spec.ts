import request from 'supertest'
import { app } from '../../app'
import { UserExchangeService } from '../../services/UserExchangeService'
import { ExchangeService } from '../../services/ExchangeService'
import { UserService } from '../../services/UserService'
import { User, Exchange, UserExchange } from '@prisma/client'
import { getExchangeData, getUserData } from '../../mocks/utils'
import { prismaCli } from '../../config/db'
// import ccxt from 'ccxt'
// const ccxtMock = ccxt as jest.Mocked<typeof ccxt>
// jest.mock('ccxt')

const userService = new UserService()
const exchangeService = new ExchangeService()
const userExchangeService = new UserExchangeService()

// const createFetchMyTradesMock = jest
//   .spyOn(new ccxtMock.kraken().prototype, 'fetchMyTrades')
//   .mockImplementation(() => {
//     return
//   })

describe('CryptoController', () => {
  let user: User
  let exchange: Exchange
  let userExchange: UserExchange
  const userData = getUserData()
  beforeAll(async () => {
    user = await userService.create(userData)
    exchange = await exchangeService.create(getExchangeData())
    userExchange = await userExchangeService.create(user.id, exchange.id, 'test', 'test')
  })

  test('should fetch a users trades and balances', async () => {
    await request(app)
      .get(`/crypto/${userExchange.id}/refresh`)
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${user.email}:${userData.password}`).toString('base64')}`
      )
      .expect(200)

    const tradeCount = await prismaCli.trade.count({
      where: {
        userExchangeId: userExchange.id,
      },
    })
    expect(tradeCount).toEqual(2)
  })

  afterAll(async () => {
    await prismaCli.trade.deleteMany({
      where: {
        userExchangeId: userExchange.id,
      },
    })
    await exchangeService.delete(exchange.id)
    await userService.delete(user.id)
    await exchangeService.delete(exchange.id)
  })
})
