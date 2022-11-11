import { prismaCli } from '../config/db'
import { User, UserStatus } from '@prisma/client'
import { v4 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'
import env from '../config/env'
import bcrypt from 'bcrypt'
import ApiError from '../utils/ApiError'

export interface UserCreateParams {
  email: string
  password: string
}

export class UserService {
  async createUser(params: UserCreateParams): Promise<User> {
    const existingUser = await prismaCli.user.findUnique({
      where: { email: params.email },
    })

    if (existingUser) {
      throw new ApiError(409, 'User already exists')
    }

    const hashedPassword = await bcrypt.hash(params.password, 10)

    const user = await prismaCli.user.create({
      data: {
        id: uuid(),
        email: params.email,
        status: UserStatus.INACTIVE,
      },
    })

    await prismaCli.userSecret.create({
      data: {
        id: uuid(),
        userId: user.id,
        secret: hashedPassword,
      },
    })
    return user
  }

  async getUser(id: string): Promise<User | null> {
    return await prismaCli.user.findUnique({
      where: {
        id,
      },
    })
  }

  async generateSessionToken(user: User): Promise<string> {
    const { id, email } = user
    const secret = env.JWT_SIGNING_SALT
    const token = jwt.sign({ sub: id, email }, secret, {
      expiresIn: '10d',
    })
    return token
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const maybeUser = await prismaCli.user.findUnique({
      where: { email },
    })

    const hashedPassword = await prismaCli.userSecret.findUnique({
      where: { userId: maybeUser?.id },
    })

    if (maybeUser && hashedPassword) {
      const isPasswordValid = await bcrypt.compare(password, hashedPassword.secret)

      if (isPasswordValid) {
        // update user status and return access token
        const user = await prismaCli.user.update({
          where: { id: maybeUser.id },
          data: { status: UserStatus.ACTIVE },
        })
        const token = await this.generateSessionToken(user)
        return { token, user }
      } else {
        throw new ApiError(401, 'Invalid email or password')
      }
    } else {
      throw new ApiError(401, 'Invalid email or password')
    }
  }

  async logout(id: string): Promise<void> {
    await prismaCli.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    })
  }
}
