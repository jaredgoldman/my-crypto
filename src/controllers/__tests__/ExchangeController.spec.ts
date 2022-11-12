import request from 'supertest'
import { prismaCli } from '../../config/db'
import mockAuthData from '../../mocks/auth.json'
import { app } from '../../app'
import { v4 as uuid } from 'uuid'

describe('GET /exchange', () => {
  beforeAll(async () => {
    await prismaCli.exchange.createMany({
      data: [
        {
          id: uuid(),
          name: 'testExchange1',
          url: 'https://test.com',
          image: 'https://test.com/image.png',
        },
        {
          id: uuid(),
          name: 'testExchange2',
          url: 'https://test.com',
          image: 'https://test.com/image.png',
        },
      ],
    })
  })

  // TODO: Will break when actual exchanges are added
  test('should return two exchanges', () => {
    return request(app)
      .get('/exchanges')
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        expect(res.body.data.data.length).toBe(2)
      })
  })

  afterAll(async () => {
    await prismaCli.exchange.deleteMany({
      where: { url: 'https://test.com' },
    })
  })
})

describe('GET /exchange/:id', () => {
  const id = uuid()
  beforeAll(async () => {
    await prismaCli.exchange.create({
      data: {
        id: id,
        name: 'testExchange',
        url: 'https://test.com',
        image: 'https://test.com/image.png',
      },
    })
  })

  test('should return an exchange', () => {
    return request(app)
      .get(`/exchanges/${id}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        expect(res.body.data.id).toBe(id)
      })
  })

  afterAll(async () => {
    await prismaCli.exchange.delete({
      where: { id },
    })
  })
})

describe('POST /exchange', () => {
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
        expect(res.body.data.name).toBe('testExchange')
      })
  })
  afterAll(async () => {
    await prismaCli.exchange.deleteMany({
      where: { name: 'testExchange' },
    })
  })
})
