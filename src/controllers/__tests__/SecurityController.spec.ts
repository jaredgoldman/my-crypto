import request from 'supertest'
import { app } from '../../app'
import mockAuthData from '../../mocks/auth.json'

describe('GET /secure', () => {
  test('should return 200 OK with auth', () => {
    return request(app).get('/secure').set('Authorization', mockAuthData.jwt).expect(200)
  })

  test('should return 401 Unauthorized without auth', () => {
    return request(app).get('/secure').expect(401)
  })

  test('should return a 401 with an invalid token', () => {
    return request(app).get('/secure').set('Authorization', '123').expect(401)
  })
})
