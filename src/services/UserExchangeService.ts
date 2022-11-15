import { Exchange, UserExchange } from '@prisma/client'
import { prismaCli } from '../config/db'
import { v4 as uuid } from 'uuid'
import { Paginated } from '../types/api'
import ApiError from '../utils/ApiError'
import { KeyService } from './KeyService'
import { CcxtService } from './CcxtService'

export class UserExchangeService {
  private keyService = new KeyService()

  async create(
    userId: string,
    exchangeId: string,
    apiKey: string,
    apiSecret: string
  ): Promise<UserExchange> {
    const maybeUserExchange = await this.get(userId, exchangeId)

    if (maybeUserExchange) {
      throw new ApiError(400, 'User exchange already exists')
    }

    const hashedApiKey = this.keyService.encrypt(apiKey)
    const hasedApiSecret = this.keyService.encrypt(apiSecret)

    const userExchangeKey = await prismaCli.userExchangeKey.create({
      data: {
        userId,
        exchangeId,
        key: hashedApiKey.encryptedKey,
        keyIv: hashedApiKey.iv,
        secret: hasedApiSecret.encryptedKey,
        secretIv: hasedApiSecret.iv,
      },
    })

    return await prismaCli.userExchange.create({
      data: {
        userId,
        exchangeId,
        userExchangeKeyId: userExchangeKey.id,
      },
    })
  }

  async delete(id: string): Promise<UserExchange> {
    const userExchange = await prismaCli.userExchange.findFirst({
      where: { id },
    })
    if (userExchange) {
      await prismaCli.userExchange.deleteMany({ where: { id } })
      await prismaCli.userExchangeKey.deleteMany({
        where: { id: userExchange.userExchangeKeyId },
      })
      return userExchange
    }
    throw new ApiError(404, 'User exchange not found')
  }

  async get(userId: string, exchangeId: string): Promise<UserExchange | null> {
    const userExchange = prismaCli.userExchange.findFirst({
      where: { userId, exchangeId },
    })

    if (!userExchange) {
      throw new ApiError(404, 'User exchange not found')
    }

    return userExchange
  }

  async getAll(
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

  async initializeUserExchange(userId: string, exchangeId: string): Promise<any> {
    // find user, grab keys
    const userExchange = await this.get(userId, exchangeId)
  }
}
