import request from 'supertest'
import { app } from 'src/app'
import mockAuthData from '../../mocks/auth.json'
import { Status } from '@prisma/client'
import { prismaCli } from '../../config/db'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcrypt'

const id = mockAuthData.userId
const jwt = mockAuthData.jwt
const user = {
  email: 'test@test.com',
  password: 'test',
}

describe('POST /user', () => {
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
    await prismaCli.user.delete({
      where: { email: user.email },
    })
    await prismaCli.userSecret.delete({
      where: { userId: newUserId },
    })
  })
})

describe('POST /user/delete', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: Status.ACTIVE,
      },
    })
  })

  test('should return a 200 status', async () => {
    return await request(app).post(`/user/delete`).set('Authorization', jwt).expect(200)
  })
})

describe('GET /user/{userId}', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: Status.INACTIVE,
      },
    })
  })

  test('should return the correct user', async () => {
    return await request(app)
      .get(`/user/${id}`)
      .set('Authorization', jwt)
      .expect(res => {
        expect(res.body.data.id).toBe(id)
      })
  })

  test('should return a 404 if user not found', async () => {
    return await request(app)
      .get(`/user/${uuid()}`)
      .set('Authorization', mockAuthData.jwt)
      .expect(404)
  })

  afterAll(async () => {
    await prismaCli.user.delete({
      where: { id },
    })
  })
})

describe('POST /user/login', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: Status.INACTIVE,
      },
    })
    const hashedPassword = await bcrypt.hash(user.password, 10)
    await prismaCli.userSecret.create({
      data: {
        id: uuid(),
        userId: id,
        secret: hashedPassword,
      },
    })
  })

  test('should return a token', async () => {
    return await request(app)
      .post('/user/login')
      .send(user)
      .expect(res => {
        expect(res.body.data.token).toBeTruthy()
        expect(res.body.data.user.email).toBe(user.email)
        expect(res.body.data.user.status).toBe(Status.ACTIVE)
      })
  })

  afterAll(async () => {
    await prismaCli.user.delete({
      where: { id },
    })
    await prismaCli.userSecret.delete({
      where: { userId: id },
    })
  })
})

describe('POST /user/logout', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: Status.ACTIVE,
      },
    })
  })
  test('should return a 204', async () => {
    await request(app)
      .post('/user/logout')
      .set('Authorization', jwt)
      .send({
        id,
      })
      .expect(204)

    const loggedOutUser = await prismaCli.user.findUnique({
      where: { id },
    })

    expect(loggedOutUser?.status).toBe(Status.INACTIVE)
  })

  afterAll(async () => {
    await prismaCli.user.delete({
      where: { id },
    })
  })
})
