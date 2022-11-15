import request from 'supertest'
import { prismaCli } from '../../config/db'
import mockAuthData from '../../mocks/auth.json'
import { app } from '../../app'
import { ExchangeService } from '../../services/ExchangeService'

const exchangeService = new ExchangeService()

describe('GET /exchange', () => {
  let newExchangeId = ''
  beforeAll(async () => {
    const newExchage = await exchangeService.create({
      name: 'Test Exchange',
      url: 'https://test.com',
      image: 'https://test.exchange/image.png',
    })
    newExchangeId = newExchage.id
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
    await exchangeService.delete(newExchangeId)
  })
})

describe('GET /exchange/:id', () => {
  let newExchangeId = ''
  beforeAll(async () => {
    const exchange = await exchangeService.create({
      name: 'Test Exchange',
      url: 'https://test.com',
      image: 'https://test.exchange/image.png',
    })
    newExchangeId = exchange.id
  })

  test('should return an exchange', () => {
    return request(app)
      .get(`/exchanges/${newExchangeId}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        expect(res.body.data.id).toBe(newExchangeId)
        expect(res.body.data.name).toBe('Test Exchange')
        expect(res.body.data.url).toBe('https://test.com')
        expect(res.body.data.image).toBe('https://test.exchange/image.png')
      })
  })

  afterAll(async () => {
    await exchangeService.delete(newExchangeId)
  })
})

describe('POST /exchange', () => {
  let newExchangeId = ''
  test('should create an exchange', () => {
    return request(app)
      .post('/exchanges')
      .set('Authorization', mockAuthData.jwt)
      .send({
        name: 'testExchange',
        url: 'https://test.com',
        image: 'https://test.com/image.png',
      })
      .expect(res => {
        newExchangeId = res.body.data.id
        expect(res.body.data.name).toBe('testExchange')
      })
  })
  afterAll(async () => {
    await exchangeService.delete(newExchangeId)
  })
})
