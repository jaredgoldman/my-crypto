import { Exchange, UserExchange } from '@prisma/client'
import { prismaCli } from '../config/db'
import { v4 as uuid } from 'uuid'
import { Paginated } from '../types/api'
import bcrypt from 'bcrypt'

export class UserExchangeService {
  async createUserExchange(
    userId: string,
    exchangeId: string,
    apiKey: string
  ): Promise<UserExchange> {
    const hashedApiKey = await bcrypt.hash(apiKey, 10)

    await prismaCli.userExchangeKey.create({
      data: {
        id: uuid(),
        userId,
        exchangeId,
        key: hashedApiKey,
      },
    })

    return await prismaCli.userExchange.create({
      data: {
        id: uuid(),
        userId,
        exchangeId,
      },
    })
  }

  async deleteUserExchange(userId: string, exchangeId: string): Promise<UserExchange> {
    return await prismaCli.userExchange.delete({
      where: { userId_exchangeId: { userId, exchangeId } },
    })
  }

  async getUserExchange(
    userId: string,
    exchangeId: string
  ): Promise<UserExchange | null> {
    return await prismaCli.userExchange.findFirst({
      where: { userId, exchangeId },
    })
  }

  async getUserExchanges(
    userId: string,
    page: number,
    limit: number
  ): Promise<Paginated<UserExchange & { exchange: Exchange }>> {
    const userExchanges = await prismaCli.userExchange.findMany({
      where: { userId },
      skip: page ? page * limit : 0,
      take: limit,
      include: { exchange: true },
    })

    return {
      data: userExchanges,
      next: userExchanges.length === limit ? page + 1 : null,
      previous: page > 0 ? page - 1 : null,
    }
  }
}
