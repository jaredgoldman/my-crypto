import { UserService } from '../UserService'
import { getUserData } from '../../mocks/utils'
import { prismaCli } from '../../config/db'
import { Status, User } from '@prisma/client'

const userService = new UserService()

const userData = getUserData()
let user: User

describe('user service', () => {
  test('should create a user', async () => {
    user = await userService.create(userData)
    expect(user.name).toBe(userData.name)
  })
  test('should get a user', async () => {
    const foundUser = await userService.get(user.id)
    expect(foundUser?.name).toBe(userData.name)
  })
  test('should log a user in', async () => {
    const foundUser = await userService.login(userData.email, userData.password)
    expect(foundUser.token).toBeDefined()
    expect(foundUser.user.name).toBe(userData.name)
    expect(foundUser.user.email).toBe(userData.email)
    expect(foundUser.user.status).toBe(Status.ACTIVE)
  })
  test('should generate a session token', async () => {
    const token = await userService.generateSessionToken(user)
    expect(token).toBeDefined()
  })
  test('should log a user out', async () => {
    await userService.logout(user.id)
    const foundUser = await prismaCli.user.findUnique({ where: { id: user.id } })
    expect(foundUser?.status).toBe(Status.INACTIVE)
  })
  test('should delete a user', async () => {
    await userService.delete(user.id)
    const foundUser = await prismaCli.user.findUnique({ where: { id: user.id } })
    expect(foundUser).toBe(null)
  })
})
