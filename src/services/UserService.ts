import { prismaCli } from '../config/db'
import { User, Status } from '@prisma/client'
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError'
import { KeyService } from './KeyService'
import { UserSecret } from '@prisma/client'
import { Logger } from '../config/logger'

export interface UserCreateParams {
  email: string
  password: string
  name: string
}

export class UserService {
  private keyService = new KeyService()

  async create(params: UserCreateParams): Promise<User | undefined> {
    const existingUser = await prismaCli.user.findUnique({
      where: { email: params.email },
    })

    if (existingUser) {
      Logger.warn('user.alreadyExists')
      return
    }

    const hashedPassword = await bcrypt.hash(params.password, 10)

    const user = await prismaCli.user.create({
      data: {
        email: params.email,
        status: Status.INACTIVE,
        name: params.name,
      },
    })

    await prismaCli.userSecret.create({
      data: {
        userId: user.id,
        secret: hashedPassword,
      },
    })
    return user
  }

  async delete(id: string): Promise<User> {
    await prismaCli.userSecret.deleteMany({
      where: { userId: id },
    })
    return await prismaCli.user.delete({
      where: { id },
    })
  }

  async get(id: string): Promise<User | null> {
    return await prismaCli.user.findUnique({
      where: {
        id,
      },
    })
  }

  async authenticate(email: string, password: string): Promise<User | void> {
    const user = await prismaCli.user.findUnique({
      where: { email: email },
    })

    if (!user) {
      Logger.warn('general.notFound')
      return
    }

    const userSecret = (await prismaCli.userSecret.findUnique({
      where: { userId: user.id },
    })) as UserSecret

    const isPasswordValid = await this.keyService.compare(password, userSecret.secret)
    if (isPasswordValid) {
      return user
    }
    Logger.warn('general.invalidCredentials')
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const maybeUser = await prismaCli.user.findUnique({
      where: { email },
    })

    if (!maybeUser) {
      throw new ApiError('user.exists')
    }

    const hashedPassword = await prismaCli.userSecret.findUnique({
      where: { userId: maybeUser?.id },
    })

    if (hashedPassword) {
      const isPasswordValid = await bcrypt.compare(password, hashedPassword.secret)

      if (isPasswordValid) {
        // update user status and return access token
        const user = await prismaCli.user.update({
          where: { id: maybeUser.id },
          data: { status: Status.ACTIVE },
        })
        const token = this.keyService.generateSessionToken(user)
        return { token, user }
      } else {
        throw new ApiError('general.invalidCredentials')
      }
    } else {
      throw new ApiError('general.invalidCredentials')
    }
  }

  async logout(id: string): Promise<void> {
    await prismaCli.user.update({
      where: { id },
      data: { status: Status.INACTIVE },
    })
  }
}
