import { prismaCli } from '../config/db'
import { Exchange, UserExchange } from '@prisma/client'
import { Paginated } from '../types/api'
import { KeyService } from './KeyService'
import CcxtRestService from './CcxtRestService'
import { Logger } from '@src/config/logger'
import { UserExchangeKey } from '../types/key'

export class UserExchangeService {
  private keyService = new KeyService()

  async create(
    userId: string,
    exchangeId: string,
    apiKey: string,
    apiSecret: string
  ): Promise<UserExchange | void> {
    const exchange = await prismaCli.exchange.findFirst({
      where: { id: exchangeId },
    })

    if (!exchange) {
      Logger.warn('exchange.notFound')
      return
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

  async delete(id: string): Promise<boolean> {
    try {
      const userExchange = await prismaCli.userExchange.findUnique({
        where: { id },
      })
      if (userExchange) {
        await prismaCli.userExchange.delete({ where: { id } })
        await prismaCli.userExchangeKey.deleteMany({
          where: { id: userExchange.userExchangeKeyId },
        })
        return true
      } else {
        Logger.warn('userExchange.notFound')
        return false
      }
    } catch (error) {
      Logger.warn('userExchange.general', error)
      return false
    }
  }

  async get(id: string): Promise<UserExchange | null> {
    const userExchange = await prismaCli.userExchange.findUnique({
      where: { id },
    })

    if (!userExchange) {
      Logger.warn('userExchange.notFound')
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
      Logger.warn('userExchange.notFound')
    }

    return userExchanges
  }

  async getUserExchangeKeys(id: string, userId: string): Promise<UserExchangeKey | void> {
    const userExchange = await prismaCli.userExchange.findUnique({
      where: { id },
      include: { userExchangeKey: true, exchange: true },
    })

    if (!userExchange || userExchange.userId !== userId) {
      Logger.warn('userExchange.notFound')
      return
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
