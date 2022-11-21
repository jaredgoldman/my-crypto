import { prismaCli } from '../../config/db'
import { app } from '../../app'
import request from 'supertest'
import { v4 as uuid } from 'uuid'
import { Exchange, User, UserExchange } from '@prisma/client'
import { UserExchangeService } from '../../services/UserExchangeService'
import { UserService } from '../../services/UserService'
import { ExchangeService } from '../../services/ExchangeService'
import { KeyService } from '../../services/KeyService'
import { getUserData, getExchangeData } from '../../mocks/utils'

const userService = new UserService()
const exchangeService = new ExchangeService()
const userExchangeService = new UserExchangeService()
const keyService = new KeyService()

describe('POST /user-exchange', () => {
  let exchange: Exchange
  let user: User
  let jwt = ''
  let userExchangeId = ''
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
    user = await userService.create(getUserData())
    jwt = keyService.generateSessionToken(user)
  })

  test('should create a user exchange', async () => {
    return await request(app)
      .post('/user-exchange')
      .set('Authorization', `${jwt}`)
      .send({
        exchangeId: exchange.id,
        apiKey: uuid(),
        apiSecret: uuid(),
      })
      .expect(res => {
        userExchangeId = res.body.data.id
        expect(res.body.data.exchangeId).toBe(exchange.id)
        expect(res.body.data.userId).toBe(user.id)
        expect(res.body.data.userExchangeKeyId).toBeTruthy()
      })
  })

  afterAll(async () => {
    await userExchangeService.delete(userExchangeId)
    await userService.delete(user.id)
    await exchangeService.delete(exchange.id)
  })
})

describe('GET /user-exchange', () => {
  let exchange: Exchange
  let user: User
  let userExchange: UserExchange
  let jwt = ''
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
    user = await userService.create(getUserData())
    jwt = keyService.generateSessionToken(user)
    userExchange = await userExchangeService.create(user.id, exchange.id, uuid(), uuid())
  })

  test('should get user exchanges', async () => {
    const numOfCurrentExchanges = await prismaCli.userExchange.count({
      where: {
        userId: user.id,
      },
    })

    return request(app)
      .get('/user-exchange')
      .set('Authorization', `${jwt}`)
      .expect(res => {
        expect(res.body.data.data.length).toBe(numOfCurrentExchanges)
      })
  })

  afterAll(async () => {
    await userExchangeService.delete(userExchange.id)
    await exchangeService.delete(exchange.id)
    await userService.delete(user.id)
  })
})

describe('GET/ user-exchange/{exchangeId}', () => {
  let exchange: Exchange
  let user: User
  let userExchange: UserExchange
  let jwt = ''
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
    user = await userService.create(getUserData())
    jwt = keyService.generateSessionToken(user)
    userExchange = await userExchangeService.create(user.id, exchange.id, uuid(), uuid())
  })

  test('should return a user exchange', async () => {
    return await request(app)
      .get(`/user-exchange/${userExchange.id}`)
      .set('Authorization', `${jwt}`)
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

describe('POST /user-exchange/delete', () => {
  let exchange: Exchange
  let user: User
  let userExchange: UserExchange
  let jwt = ''
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
    user = await userService.create(getUserData())
    jwt = keyService.generateSessionToken(user)
    userExchange = await userExchangeService.create(user.id, exchange.id, uuid(), uuid())
  })

  test('should delete a user exchange', async () => {
    return await request(app)
      .post(`/user-exchange/delete?userExchangeId=${userExchange.id}`)
      .set('Authorization', `${jwt}`)
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
