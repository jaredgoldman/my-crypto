import { Exchange, UserExchange } from '@prisma/client'
import { prismaCli } from '../config/db'
import { v4 as uuid } from 'uuid'
import { Paginated } from '@src/types/api'
import bcrypt from 'bcrypt'

export type ExchangeCreationParams = Pick<Exchange, 'name' | 'url' | 'image'>

export class ExchangeService {
  async get(id: string): Promise<Exchange | null> {
    return await prismaCli.exchange.findFirst({ where: { id } })
  }

  async getAll(page: number, limit: number): Promise<Paginated<Exchange>> {
    const exchanges = await prismaCli.exchange.findMany({
      skip: page ? page * limit : 0,
      take: limit,
    })

    return {
      data: exchanges,
      next: exchanges.length === limit ? page + 1 : null,
      previous: page > 0 ? page - 1 : null,
    }
  }

  async create(params: ExchangeCreationParams): Promise<Exchange> {
    return await prismaCli.exchange.create({
      data: {
        id: uuid(),
        name: params.name,
        url: params.url,
        image: params.image,
      },
    })
  }

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
