import request from 'supertest'
import { Exchange } from '@prisma/client'
import { prismaCli } from '../../config/db'
import mockAuthData from '../../mocks/auth.json'
import { app } from '../../app'
import { ExchangeService } from '../../services/ExchangeService'
import { getExchangeData } from '../../mocks/utils'

const exchangeService = new ExchangeService()

describe('GET /exchange', () => {
  let exchange: Exchange
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
  })

  // TODO: Will break when actual exchanges are added
  test('should return two exchanges', async () => {
    const exchangeNumber = await prismaCli.exchange.count()
    return request(app)
      .get('/exchanges')
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        expect(res.body.data.data.length).toBe(exchangeNumber)
      })
  })

  afterAll(async () => {
    await exchangeService.delete(exchange.id)
  })
})

describe('GET /exchange/:id', () => {
  let exchange: Exchange
  beforeAll(async () => {
    exchange = await exchangeService.create(getExchangeData())
  })

  test('should return an exchange', () => {
    return request(app)
      .get(`/exchanges/${exchange.id}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        expect(res.body.data.id).toBe(exchange.id)
        expect(res.body.data.name).toBe(exchange.name)
        expect(res.body.data.url).toBe(exchange.url)
        expect(res.body.data.image).toBe(exchange.image)
      })
  })

  afterAll(async () => {
    await exchangeService.delete(exchange.id)
  })
})

describe('POST /exchange', () => {
  const exchange = getExchangeData()
  let exchangeId = ''
  test('should create an exchange', () => {
    return request(app)
      .post('/exchanges')
      .set('Authorization', mockAuthData.jwt)
      .send({
        name: exchange.name,
        url: exchange.url,
        displayName: exchange.displayName,
        image: exchange.image,
      })
      .expect(res => {
        exchangeId = res.body.data.id
        expect(res.body.data.name).toBe(exchange.name)
      })
  })
  afterAll(async () => {
    await exchangeService.delete(exchangeId)
  })
})
