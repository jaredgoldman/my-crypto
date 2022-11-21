import request from 'supertest'
import { app } from '../../app'
import { UserService } from '../../services/UserService'
import mockAuthData from '../../mocks/auth.json'
import { getUserData } from '../../mocks/utils'

const userService = new UserService()

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

describe('GET /secure/basic', () => {
  const userData = getUserData()
  beforeAll(async () => {
    await userService.create(userData)
  })
  test('should return 200 OK with auth', () => {
    return request(app)
      .get('/secure/basic')
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString(
          'base64'
        )}`
      )
      .expect(200)
  })
})
