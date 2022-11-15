import { prismaCli } from '../../config/db'
import mockAuthData from '../../mocks/auth.json'
import { app } from '../../app'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { Exchange, User, UserExchange } from '@prisma/client'
import { UserExchangeService } from '../../services/UserExchangeService'
import { UserService } from '../../services/UserService'
import { ExchangeService } from '../../services/ExchangeService'
import { getUserData, getExchangeData } from '../../mocks/utils'
const userService = new UserService()
const exchangeService = new ExchangeService()
const userExchangeService = new UserExchangeService()

describe('POST /user-exchange', () => {
  let userData = getUserData()
  let exchange: Exchange
  let userExchangeKeyId = ''
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
    await prismaCli.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        id: mockAuthData.userId,
      },
    })
  })

  test('should create a user exchange', async () => {
    return await request(app)
      .post('/user-exchange')
      .set('Authorization', `${mockAuthData.jwt}`)
      .send({
        exchangeId: exchange.id,
        apiKey: uuid(),
        apiSecret: uuid(),
      })
      .expect(res => {
        userExchangeKeyId = res.body.data.userExchangeId
        expect(res.body.data.exchangeId).toBe(exchange.id)
        expect(res.body.data.userId).toBe(mockAuthData.userId)
        expect(res.body.data.userExchangeKeyId).toBeTruthy()
      })
  })

  afterAll(async () => {
    await userExchangeService.delete(userExchangeKeyId)
    await userService.delete(mockAuthData.userId)
    await exchangeService.delete(exchange.id)
  })
})

describe.skip('GET /user-exchange', () => {
  let exchange: Exchange
  let userExchange: UserExchange
  test('should get user exchanges', async () => {
    beforeAll(async () => {
      exchange = await exchangeService.create(getExchangeData())
      userExchange = await userExchangeService.create(
        mockAuthData.userId,
        exchange.id,
        uuid(),
        uuid()
      )
    })

    const numOfCurrentExchanges = await prismaCli.userExchange.count({
      where: {
        userId: mockAuthData.userId,
      },
    })

    return request(app)
      .get('/user-exchange')
      .set('Authorization', `${mockAuthData.jwt}`)
      .expect(res => {
        expect(res.body.data.data.length).toBe(numOfCurrentExchanges + 1)
      })
  })

  afterAll(async () => {
    await exchangeService.delete(exchange.id)
    await userExchangeService.delete(userExchange.id)
  })
})

describe.skip('GET/ user-exchange/{exchangeId}', () => {
  let exchange: Exchange
  let user: User
  let userExchange: UserExchange
  beforeAll(async () => {
    user = await userService.create(getUserData())
    exchange = await exchangeService.create(getExchangeData())
    userExchange = await userExchangeService.create(
      user.id,
      exchange.id,
      'test-value',
      'test'
    )
  })

  test('should return a user exchange', async () => {
    return await request(app)
      .get(`/user-exchange/${userExchange.id}`)
      .set('Authorization', `${mockAuthData.jwt}`)
      .expect(200)
      .expect(res => {
        expect(res.body.data.id).toEqual(userExchange.id)
        expect(res.body.data.userId).toEqual(userExchange.userId)
        expect(res.body.data.exchangeId).toEqual(exchange.id)
      })
  })

  afterAll(async () => {
    await userExchangeService.delete(userExchange.id)
    await userService.delete(user.id)
    await exchangeService.delete(exchange.id)
  })
})

describe.skip('PUT /user-exchange/delete', () => {
  let userExchange: UserExchange
  beforeAll(async () => {
    const user = await userService.create(getUserData())
    const exchange = await exchangeService.create(getExchangeData())
    userExchange = await userExchangeService.create(user.id, exchange.id, 'test', 'test')
  })

  test('should delete a user exchange', async () => {
    return await request(app)
      .post(
        `/user-exchange/delete?exchangeId=${userExchange.id}&userId=${userExchange.userId}`
      )
      .set('Authorization', `${mockAuthData.jwt}`)
      .expect(201)
      .expect(res => {
        expect(res.body.data.id).toEqual(userExchange.id)
        expect(res.body.data.userId).toEqual(userExchange.userId)
        expect(res.body.data.exchangeId).toEqual(userExchange.exchangeId)
      })
  })
  afterAll(async () => {
    await userService.delete(userExchange.userId)
    await exchangeService.delete(userExchange.exchangeId)
  })
})
