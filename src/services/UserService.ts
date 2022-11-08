import { prismaCli } from '../config/db'
import { User, UserStatus } from '@prisma/client'
import { v4 as uuid } from 'uuid'
import jwt from 'jsonwebtoken'
import env from '../config/env'

export type UserCreateParams = Pick<User, 'username' | 'email'>

export class UserService {
  async createUser(params: UserCreateParams): Promise<User> {
    return await prismaCli.user.create({
      data: {
        id: uuid(),
        username: params.username,
        email: params.email,
        status: UserStatus.INACTIVE,
      },
    })
  }

  async getUser(id: string): Promise<User | null> {
    return await prismaCli.user.findUnique({
      where: {
        id,
      },
    })
  }

  async generateToken(user: User): Promise<string> {
    const { id, username, email } = user
    const secret = env.JWT_SIGNING_SALT
    const token = jwt.sign({ sub: id, username, email }, secret, {
      expiresIn: '10d',
    })
    return token
  }
}
