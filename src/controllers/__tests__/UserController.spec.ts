import request from 'supertest'
import { app } from '../../app'
import { Status, User } from '@prisma/client'
import { prismaCli } from '../../config/db'
import { v4 as uuid } from 'uuid'
import { UserService } from '../../services/UserService'
import { getUserData } from '../../mocks/utils'

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
  const userData = getUserData()
  const userData2 = getUserData()
  let user: User
  let user2: User
  beforeAll(async () => {
    user = await userService.create(userData)
    user2 = await userService.create(userData2)
  })

  test('should return a 200 status', async () => {
    await request(app)
      .post(`/user/delete/${user.id}`)
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString(
          'base64'
        )}`
      )
      .expect(200)

    const deletedUser = await userService.get(user.id)
    expect(deletedUser).toBeNull()
  })

  test('should return a 403 if a user is requesting a user other than themselves', async () => {
    await request(app)
      .post(`/user/delete/${uuid()}`)
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${userData2.email}:${userData2.password}`).toString(
          'base64'
        )}`
      )
      .expect(403)
  })

  afterAll(async () => {
    await userService.delete(user2.id)
  })
})

describe('GET /user/{userId}', () => {
  const userData = getUserData()
  let user: User
  beforeAll(async () => {
    user = await userService.create(userData)
  })
  test('should return the correct user', async () => {
    return await request(app)
      .get(`/user/${user.id}`)
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString(
          'base64'
        )}`
      )
      .expect(res => {
        expect(res.body.data.id).toBe(user.id)
        expect(res.body.data.email).toBe(user.email)
      })
  })

  test('should return a 403 if user is requesting anyone other than themselves', async () => {
    return await request(app)
      .get(`/user/${uuid()}`)
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString(
          'base64'
        )}`
      )
      .expect(403)
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
  const userData = getUserData()
  let user: User
  beforeAll(async () => {
    user = await userService.create(userData)
  })

  test('should return a 204', async () => {
    await request(app)
      .post('/user/logout')
      .set(
        'Authorization',
        `Basic ${Buffer.from(`${userData.email}:${userData.password}`).toString(
          'base64'
        )}`
      )
      .expect(204)

    const loggedOutUser = await prismaCli.user.findUnique({
      where: { id: user.id },
    })

    expect(loggedOutUser?.status).toBe(Status.INACTIVE)
  })

  afterAll(async () => {
    await userService.delete(user.id)
  })
})
