import { prismaCli } from '../../config/db'
import mockAuthData from '../../mocks/auth.json'
import { app } from 'src/app'
import request from 'supertest'

import { v4 as uuid } from 'uuid'
import { Status } from '@prisma/client'

const userData = {
  id: mockAuthData.userId,
  email: 'test@test.com',
  status: Status.ACTIVE,
}
const exchangeData = {
  id: uuid(),
  name: 'Test Exchange',
  url: 'https://test.com',
  image: 'https://test.exchange/image.png',
}
const userExchangeData = {
  id: uuid(),
  userId: mockAuthData.userId,
  exchangeId: exchangeData.id,
}

beforeAll(async () => {
  await prismaCli.user.create({
    data: userData,
  })
  await prismaCli.exchange.create({
    data: exchangeData,
  })
})

describe('POST /user-exchage', () => {
  test('should create a user exchange', async () => {
    return await request(app)
      .post('/user-exchange')
      .set('Authorization', `${mockAuthData.jwt}`)
      .send({
        exchangeId: exchangeData.id,
        apiKey: 'test-api-key',
      })
      .expect(201)
  })

  afterAll(async () => {
    await prismaCli.userExchange.deleteMany({
      where: {
        exchangeId: exchangeData.id,
        userId: mockAuthData.userId,
      },
    })
  })
})

describe('GET /user-exchange', () => {
  const exchangesData = [
    {
      id: uuid(),
      name: 'Test Exchange1',
      url: 'https://test.exchange',
      image: 'https://test.exchange/image2.png',
    },
    {
      id: uuid(),
      name: 'Test Exchange2',
      url: 'https://test.exchange',
      image: 'https://test.exchange/image3.png',
    },
    {
      id: uuid(),
      name: 'Test Exchange3',
      url: 'https://test.exchange',
      image: 'https://test.exchange/image6.png',
    },
  ]

  beforeAll(async () => {
    await prismaCli.exchange.createMany({
      data: exchangesData,
    })
    await prismaCli.userExchange.createMany({
      data: exchangesData.map(exchange => ({
        id: uuid(),
        userId: mockAuthData.userId,
        exchangeId: exchange.id,
      })),
    })
  })

  test('should get user exchanges', async () => {
    return request(app)
      .get('/user-exchange')
      .set('Authorization', `${mockAuthData.jwt}`)
      .expect(res => {
        expect(res.body.data.data.length).toBe(3)
      })
  })

  afterAll(async () => {
    await prismaCli.userExchange.deleteMany({
      where: {
        userId: mockAuthData.userId,
      },
    })
    await prismaCli.exchange.deleteMany({
      where: {
        url: 'https://test.exchange',
      },
    })
  })
})

describe('GET/ user-exchange/{exchangeId}', () => {
  beforeAll(async () => {
    await prismaCli.userExchange.create({
      data: userExchangeData,
    })
  })

  test('should return a user exchange', async () => {
    return await request(app)
      .get(`/user-exchange/${userExchangeData.exchangeId}`)
      .set('Authorization', `${mockAuthData.jwt}`)
      .expect(200)
      .expect(res => {
        expect(res.body.data.id).toEqual(userExchangeData.id)
        expect(res.body.data.userId).toEqual(userExchangeData.userId)
        expect(res.body.data.exchangeId).toEqual(userExchangeData.exchangeId)
      })
  })

  afterAll(async () => {
    await prismaCli.userExchange.delete({
      where: {
        id: userExchangeData.id,
      },
    })
  })
})

describe('PUT /user-exchange/delete', () => {
  beforeAll(async () => {
    await prismaCli.userExchange.create({
      data: userExchangeData,
    })
  })

  test('should delete a user exchange', async () => {
    return await request(app)
      .post(
        `/user-exchange/delete?exchangeId=${userExchangeData.exchangeId}&userId=${userExchangeData.userId}`
      )
      .set('Authorization', `${mockAuthData.jwt}`)
      .expect(201)
      .expect(res => {
        expect(res.body.data.id).toEqual(userExchangeData.id)
        expect(res.body.data.userId).toEqual(userExchangeData.userId)
        expect(res.body.data.exchangeId).toEqual(userExchangeData.exchangeId)
      })
  })
})

afterAll(async () => {
  await prismaCli.userExchangeKey.delete({
    where: {
      userId_exchangeId: {
        userId: mockAuthData.userId,
        exchangeId: exchangeData.id,
      },
    },
  })
  await prismaCli.user.delete({
    where: {
      id: userData.id,
    },
  })
  await prismaCli.exchange.delete({
    where: {
      id: exchangeData.id,
    },
  })
})
