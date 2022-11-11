import request from 'supertest'
import { app } from 'src/app'
import mockAuthData from '../../mocks/auth.json'
import { UserStatus } from '@prisma/client'
import { prismaCli } from '../../config/db'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcrypt'

const id = uuid()
const user = {
  email: 'test@test.com',
  password: 'test',
}

describe('POST /user', () => {
  test('should return a created user', async () => {
    return await request(app)
      .post('/user')
      .send(user)
      .expect(200)
      .then(res => {
        // store user id for later use
        expect(res.body.data.user.email).toBe(user.email)
        expect(res.body.data.user.status).toBe(UserStatus.INACTIVE)
      })
  })

  test('should return a 409 error if user already exists', async () => {
    return await request(app).post('/user').send(user).expect(409)
  })

  afterAll(async () => {
    await prismaCli.user.delete({
      where: { email: user.email },
    })
  })
})

describe('GET /user/{userId}', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: UserStatus.INACTIVE,
      },
    })
  })

  test('should return the correct user', async () => {
    return await request(app)
      .get(`/user/${id}`)
      .set('Authorization', mockAuthData.jwt)
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
      where: { email: user.email },
    })
  })
})

describe('POST /user/login', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: UserStatus.INACTIVE,
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
        expect(res.body.data.user.status).toBe(UserStatus.ACTIVE)
      })
  })

  afterAll(async () => {
    await prismaCli.user.delete({
      where: { id },
    })
  })
})

describe('POST /user/logout', () => {
  beforeAll(async () => {
    await prismaCli.user.create({
      data: {
        id,
        email: user.email,
        status: UserStatus.ACTIVE,
      },
    })
  })
  test('should return a 204', async () => {
    await request(app)
      .post('/user/logout')
      .set('Authorization', mockAuthData.jwt)
      .send({
        id,
      })
      .expect(204)

    const loggedOutUser = await prismaCli.user.findUnique({
      where: { id },
    })

    expect(loggedOutUser?.status).toBe(UserStatus.INACTIVE)
  })

  afterAll(async () => {
    await prismaCli.user.delete({
      where: { id },
    })
  })
})
