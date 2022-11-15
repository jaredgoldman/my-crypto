import request from 'supertest'
import { app } from '../../app'
import mockAuthData from '../../mocks/auth.json'
import { Status, User } from '@prisma/client'
import { prismaCli } from '../../config/db'
import { v4 as uuid } from 'uuid'
import { UserService } from '../../services/UserService'
import { getUserData } from '../../mocks/utils'
import { randEmail, randFullName } from '@ngneat/falso'

const userService = new UserService()

describe('POST /user', () => {
  const user = getUserData()
  let newUserId = ''

  test('should return a created user', async () => {
    return await request(app)
      .post('/user')
      .send(user)
      .expect(200)
      .then(res => {
        newUserId = res.body.data.user.id
        expect(res.body.data.user.email).toBe(user.email)
        expect(res.body.data.user.status).toBe(Status.INACTIVE)
      })
  })

  test('should return a 409 error if user already exists', async () => {
    return await request(app).post('/user').send(user).expect(409)
  })

  afterAll(async () => {
    await userService.delete(newUserId)
  })
})

describe('POST /user/delete', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id: mockAuthData.userId,
        email: randEmail(),
        name: randFullName(),
      },
    })
  })

  test('should return a 200 status', async () => {
    await request(app)
      .post(`/user/delete`)
      .set('Authorization', mockAuthData.jwt)
      .expect(200)
    const deletedUser = await userService.get(mockAuthData.userId)
    expect(deletedUser).toBeNull()
  })
})

describe('GET /user/{userId}', () => {
  let user: User
  beforeAll(async () => {
    user = await userService.create(getUserData())
  })
  test('should return the correct user', async () => {
    return await request(app)
      .get(`/user/${user.id}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(res => {
        expect(res.body.data.id).toBe(user.id)
        expect(res.body.data.email).toBe(user.email)
      })
  })

  test('should return a 404 if user not found', async () => {
    return await request(app)
      .get(`/user/${uuid()}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(404)
  })

  afterAll(async () => {
    await userService.delete(user.id)
  })
})

describe('POST /user/login', () => {
  const userData = getUserData()
  let user: User
  beforeAll(async () => {
    user = await userService.create(userData)
  })

  test('should return a token', async () => {
    return await request(app)
      .post('/user/login')
      .send({
        email: userData.email,
        password: userData.password,
      })
      .expect(res => {
        expect(res.body.data.token).toBeTruthy()
        expect(res.body.data.user.email).toBe(user.email)
        expect(res.body.data.user.status).toBe(Status.ACTIVE)
      })
  })

  afterAll(async () => {
    await userService.delete(user.id)
  })
})

describe('POST /user/logout', () => {
  let user: User
  beforeAll(async () => {
    user = await prismaCli.user.create({
      data: {
        id: mockAuthData.userId,
        email: 'test',
        status: Status.ACTIVE,
        name: 'test',
      },
    })
  })

  test('should return a 204', async () => {
    await request(app)
      .post('/user/logout')
      .set('Authorization', mockAuthData.jwt)
      .expect(204)

    const loggedOutUser = await prismaCli.user.findUnique({
      where: { id: mockAuthData.userId },
    })

    expect(loggedOutUser?.status).toBe(Status.INACTIVE)
  })

  afterAll(async () => {
    await userService.delete(user.id)
  })
})
