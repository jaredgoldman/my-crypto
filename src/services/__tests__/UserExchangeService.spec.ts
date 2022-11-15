import { prismaCli } from '../../config/db'
import { UserExchangeService } from '../UserExchangeService'
import { getUserData, getExchangeData } from '../../mocks/utils'
import { User, Exchange, UserExchange } from '@prisma/client'

const userExchangeService = new UserExchangeService()

let user: User
let exchange: Exchange
let userExchange: UserExchange

beforeAll(async () => {
  const { email, name } = getUserData()
  user = await prismaCli.user.create({
    data: {
      email,
      name,
    },
  })

  exchange = await prismaCli.exchange.create({
    data: getExchangeData(),
  })
})

describe('user exchange service', () => {
  test('should create a user exchange', async () => {
    userExchange = await userExchangeService.create(user.id, exchange.id, 'test', 'test')
    expect(userExchange.userId).toBe(user.id)
  })
  test('should get a user exchange', async () => {
    const userExchange = await userExchangeService.get(user.id, exchange.id)
    expect(userExchange?.userId).toBe(user.id)
  })
  test('should get all a users user exchanges', async () => {
    const userExchanges = await userExchangeService.getAll(user.id, 0, 10)
    expect(userExchanges.data.length).toBe(1)
  })
  test('should delete a user exchange', async () => {
    await userExchangeService.delete(userExchange.id)
    const foundUserExchange = await prismaCli.userExchange.findUnique({
      where: { id: userExchange?.id },
    })
    expect(foundUserExchange).toBe(null)
  })
})

afterAll(async () => {
  await prismaCli.user.delete({ where: { id: user.id } })
  await prismaCli.exchange.delete({ where: { id: exchange.id } })
})
