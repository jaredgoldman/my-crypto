import ApiError from '../utils/ApiError'
import { Exchange, ExchangeId, pro } from 'ccxt'
import ccxt from 'ccxt'
import env from '../config/env'
import { UserExchangeService } from './UserExchangeService'

// TODO: clean up after socket disconnect
const activeSocketServices = {}

const isTest = env.NODE_ENV === 'test'
export class CcxtSocketService {
  private exchangeName: ExchangeId
  private apiKey: string
  private secretKey: string
  private exchangeId: string
  private userId: string
  private userExchangeId: string
  private exchange: Exchange
  private watching: { [key: string]: boolean } = {}
  constructor(
    exchangeName: string,
    exchangeId: string,
    apiKey: string,
    secretKey: string,
    userId: string,
    userExchangeId: string,
    test: boolean = isTest
  ) {
    this.exchangeName = isTest ? 'kraken' : (exchangeName.toLowerCase() as ExchangeId)
    this.exchangeId = exchangeId
    this.apiKey = apiKey
    this.secretKey = secretKey
    this.userId = userId
    this.userExchangeId = userExchangeId

    if (ccxt.pro.exchanges.includes(this.exchangeName)) {
      this.exchange = new (ccxt.pro as any)[this.exchangeName]({
        apiKey: this.apiKey,
        secret: this.secretKey,
        enableRateLimit: true,
      })
    } else {
      throw new ApiError(400, `Exchange ${this.exchangeName} not supported in ccxt pro`)
    }

    if (!test) {
      if (!ccxt.exchanges.includes(this.exchangeName)) {
        throw new ApiError(400, 'Invalid exchange name')
      }
    }
  }

  async watchTicker(symbol: string): Promise<void> {
    this.watching[symbol] = true
    while (this.watching[symbol]) {
      const ticker = await this.exchange.watchTicker(symbol)
      // send data over socket
    }
  }

  async stopWatchingTicker(symbol: string): Promise<void> {
    this.watching[symbol] = false
  }
}

export const createCcxtSocketService = async (userExchangeId: string, userId: string) => {
  const userExchangeService = new UserExchangeService()
  const { key, secret, exchangeName, exchangeId } =
    await userExchangeService.getUserExchangeKeys(userExchangeId, userId)
  return new CcxtSocketService(
    exchangeName,
    exchangeId,
    key,
    secret,
    userId,
    userExchangeId
  )
}
