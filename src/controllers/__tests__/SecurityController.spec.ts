import request from 'supertest'
import { app } from '../../app'
import { UserService } from '../../services/UserService'
import { getUserData } from '../../mocks/utils'
import { KeyService } from '../../services/KeyService'
import { User } from '@prisma/client'

const userService = new UserService()
const keyService = new KeyService()

describe('GET /secure', () => {
  let user: User
  let jwt = ''
  beforeAll(async () => {
    user = await userService.create(getUserData())
    jwt = keyService.generateSessionToken(user)
  })
  test('should return 200 OK with auth', () => {
    return request(app).get('/secure').set('Authorization', jwt).expect(200)
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
