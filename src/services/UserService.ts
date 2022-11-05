import { prismaCli } from '@src/config/db'
import { User } from '@prisma/client'
import { v4 as uuid } from 'uuid'

export type UserCreateParams = Pick<User, 'username' | 'email'>

export class UserService {
  async createUser(params: UserCreateParams): Promise<User> {
    return await prismaCli.user.create({
      data: {
        id: uuid(),
        username: params.username,
        email: params.email,
      },
    })
  }

  async getUser(id: string): Promise<User | null> {
    return await prismaCli.user.findFirst({
      where: {
        id,
      },
    })
  }
}
