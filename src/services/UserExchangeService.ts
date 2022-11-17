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

    // const ccxtExchange = new CcxtService(
    //   exchange.name.toLocaleLowerCase(),
    //   apiKey,
    //   apiSecret
    // )

    // await ccxtExchange.initializeExchange()

    return await prismaCli.userExchange.create({
      data: {
        userId,
        exchangeId,
        userExchangeKeyId: userExchangeKey.id,
      },
    })
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
      console.log(error)
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
}
