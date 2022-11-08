import request from 'supertest'
import { app } from 'src/app'
import mockAuthData from '../../mocks/auth.json'
import { UserStatus } from '@prisma/client'
import { prismaCli } from '../../config/db'
import { v4 as uuid } from 'uuid'

describe('POST /user', () => {
  test('should return a created user', async () => {
    const user = {
      username: 'test',
      email: 'test@test.com',
    }

    return await request(app)
      .post('/user')
      .set('Authorization', mockAuthData.jwt)
      .send(user)
      .expect(200)
      .then(res => {
        expect(res.body.data.user.username).toBe(user.username)
        expect(res.body.data.user.email).toBe(user.email)
        expect(res.body.data.user.status).toBe(UserStatus.INACTIVE)
      })
  })

  afterAll(async () => {
    await prismaCli.user.deleteMany({
      where: { username: 'test' },
    })
  })
})

describe('GET /user/{userId}', () => {
  const id = uuid()

  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        username: 'testUser',
        email: 'j@j.com',
        status: UserStatus.INACTIVE,
      },
    })
  })

  test('should return the correct user', async () => {
    return await request(app)
      .get(`/user/${id}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        console.log(res.body)
        expect(res.body.data.id).toBe(id)
      })
  })

  afterAll(async () => {
    await prismaCli.user.delete({ where: { id } })
  })
})
