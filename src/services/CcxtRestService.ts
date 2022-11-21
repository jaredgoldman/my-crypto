import ApiError from '../utils/ApiError'
import env from '../config/env'
import ccxt, { ExchangeId, Exchange, Trade as CcxtTrade, Dictionary, Order } from 'ccxt'
import { wait } from '../utils/common'
import { prismaCli } from '../config/db'
import { UserExchangeService } from './UserExchangeService'
import { CurrencyType, ExchangeCurrency, Trade } from '@prisma/client'
import { v4 as uuid } from 'uuid'

const isTest = env.NODE_ENV === 'test'

export class CcxtRestService {
  private exchangeName: ExchangeId
  private apiKey: string
  private secretKey: string
  private exchangeId: string
  private userId: string
  private userExchangeId: string
  private exchange: Exchange
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
    this.exchange = new ccxt[this.exchangeName]({
      apiKey: this.apiKey,
      secret: this.secretKey,
      enableRateLimit: true,
    })

    if (!test) {
      if (!ccxt.exchanges.includes(this.exchangeName)) {
        throw new ApiError(400, 'Invalid exchange name')
      }
    }
  }

  async fetchAndStoreUserExchangeData(): Promise<void> {
    await this.fetchAndStoreTrades()
    await this.fetchAndStoreBalances()
  }

  private async fetchFormatAndStoreExchangeCurrencies(): Promise<void> {
    const currencies =
      (await this.exchange.fetchCurrencies()) as Dictionary<ExchangeCurrency>
    const exchangeCurrencies = Object.values(currencies).map(
      (currency: ExchangeCurrency) => ({
        ...currency,
        id: uuid(),
        currencyType:
          currency.code === 'USD' || currency.code === 'CAD'
            ? CurrencyType.FIAT
            : CurrencyType.CRYPTO,
        limits: JSON.stringify(currency.limits),
        info: JSON.stringify(currency.info),
        exchangeId: this.exchangeId,
      })
    )
    await prismaCli.exchangeCurrency.updateMany({
      data: exchangeCurrencies,
    })
  }

  async fetchAndStoreTrades(): Promise<void> {
    if (this.exchange.has['fetchMyTrades']) {
      let allTrades: any[] = []
      let offset = 0
      while (true) {
        let trades = await this.exchange.fetchMyTrades(undefined, undefined, undefined, {
          ofs: offset,
        })
        if (trades.length === 0) {
          break
        }
        allTrades = allTrades.concat(trades)
        offset += trades.length
        await wait(100)
      }
      const trades = allTrades.map((trade: CcxtTrade) => this.formatTrade(trade))
      await prismaCli.trade.createMany({
        // @ts-ignore
        data: trades,
        skipDuplicates: true,
      })
    } else {
      throw new ApiError(400, 'Exchange does not support fetching trades')
    }
  }

  private formatTrade(trade: CcxtTrade): Trade {
    return {
      ...trade,
      exchangeName: this.exchangeName,
      fees: JSON.stringify((trade as any).fees),
      userId: this.userId,
      userExchangeId: this.userExchangeId,
      order: trade.order || null,
      fee: JSON.stringify(trade.fee),
      info: JSON.stringify(trade.info),
      timestamp: new Date(trade.timestamp),
      type: trade.type || null,
    }
  }

  async fetchAndStoreBalances(): Promise<void> {
    const balances = await this.exchange.fetchBalance()
    // TODO: figure out a cleaner way to filter data here
    delete balances.info
    delete balances.timestamp
    delete balances.free
    delete balances.used
    delete balances.timestamp
    delete balances.datetime
    delete balances.total
    await prismaCli.coinAccount.createMany({
      data: Object.entries(balances).map(([currency, { free, used, total }]) => ({
        coin: currency,
        free,
        used,
        total,
        userId: this.userId,
        userExchangeId: this.userExchangeId,
      })),
      skipDuplicates: true,
    })
  }

  async order(
    symbol: string,
    type: Order['type'],
    side: Order['side'],
    amount: number,
    price?: number
  ): Promise<Order> {
    return await this.exchange.createOrder(symbol, type, side, amount, price)
  }
}

export const createCcxtExchange = async (userExchangeId: string, userId: string) => {
  const userExchangeService = new UserExchangeService()
  const { key, secret, exchangeName, exchangeId } =
    await userExchangeService.getUserExchangeKeys(userExchangeId, userId)
  return new CcxtRestService(
    exchangeName,
    exchangeId,
    key,
    secret,
    userId,
    userExchangeId
  )
}
