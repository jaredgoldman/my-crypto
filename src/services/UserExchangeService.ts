import { prismaCli } from '../config/db'
import { Exchange, UserExchange } from '@prisma/client'
import { Paginated } from '../types/api'
import ApiError from '../utils/ApiError'
import { KeyService } from './KeyService'
import CcxtRestService from './CcxtRestService'

export class UserExchangeService {
  private keyService = new KeyService()

  async create(
    userId: string,
    exchangeId: string,
    apiKey: string,
    apiSecret: string
  ): Promise<UserExchange> {
    const exchange = await prismaCli.exchange.findFirst({
      where: { id: exchangeId },
    })

    if (!exchange) {
      throw new ApiError(404, 'Exchange not found')
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

    // Check if exchange can be initilized - will throw error if not

    const userExchange = await prismaCli.userExchange.create({
      data: {
        userId,
        exchangeId,
        userExchangeKeyId: userExchangeKey.id,
      },
    })

    new CcxtRestService(
      exchange.name.toLowerCase(),
      exchangeId,
      apiKey,
      apiSecret,
      userId,
      userExchange.id
    )

    return userExchange
  }

  async delete(id: string): Promise<any> {
    try {
      const userExchange = await prismaCli.userExchange.findUnique({
        where: { id },
      })
      if (userExchange) {
        await prismaCli.userExchange.delete({ where: { id } })
        await prismaCli.userExchangeKey.deleteMany({
          where: { id: userExchange.userExchangeKeyId },
        })
        return userExchange
      } else {
        throw new ApiError(404, 'User exchange not found')
      }
    } catch (error) {
      throw new ApiError(404, 'User exchange not found')
    }
  }

  async get(id: string): Promise<UserExchange | null> {
    const userExchange = prismaCli.userExchange.findUnique({
      where: { id },
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

  async getByUserAndExchange(userId: string, exchangeId: string) {
    const userExchanges = await prismaCli.userExchange.findMany({
      where: { userId, exchangeId },
    })

    if (!userExchanges.length) {
      throw new ApiError(404, 'User exchange not found')
    }

    return userExchanges
  }

  async getUserExchangeKeys(
    id: string,
    userId: string
  ): Promise<{ key: string; secret: string; exchangeName: string; exchangeId: string }> {
    const userExchange = await prismaCli.userExchange.findUnique({
      where: { id },
      include: { userExchangeKey: true, exchange: true },
    })

    if (!userExchange || userExchange.userId !== userId) {
      throw new ApiError(404, 'User exchange not found')
    }

    const { key, keyIv, secret, secretIv } = userExchange.userExchangeKey

    const decryptedKey = this.keyService.decrypt({ encryptedKey: key, iv: keyIv })
    const decryptedSecret = this.keyService.decrypt({
      encryptedKey: secret,
      iv: secretIv,
    })

    return {
      key: decryptedKey,
      secret: decryptedSecret,
      exchangeName: userExchange.exchange.name,
      exchangeId: userExchange.exchange.id,
    }
  }
}
