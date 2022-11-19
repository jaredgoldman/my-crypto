import ApiError from '../utils/ApiError'
import env from '../config/env'
import ccxt, { ExchangeId, Exchange, Trade } from 'ccxt'
import { wait } from '../utils/common'
import { prismaCli } from '../config/db'
import trades from '../mocks/trades.json'

const isTest = env.NODE_ENV === 'test'

export class CcxtService {
  private exchangeName: string
  private apiKey: string
  private secretKey: string
  private exchangeId: ExchangeId
  private userId: string
  private userExchangeId: string
  private exchange?: Exchange
  constructor(
    exchangeName: string,
    apiKey: string,
    secretKey: string,
    userId: string,
    userExchangeId: string
  ) {
    this.exchangeId = exchangeName.toLowerCase() as ExchangeId
    this.exchangeName = exchangeName
    this.apiKey = apiKey
    this.secretKey = secretKey
    this.userId = userId
    this.userExchangeId = userExchangeId

    if (!isTest) {
      if (!ccxt.exchanges.includes(this.exchangeId)) {
        throw new ApiError(400, 'Invalid exchange name')
      }
      this.exchange = new ccxt[this.exchangeId]({
        apiKey: this.apiKey,
        secret: this.secretKey,
        // verbose: true,
        enableRateLimit: true,
      })
    }
  }

  async fetchAndStoreUserExchangeData(): Promise<any> {
    const trades = await this.fetchTrades()
    await prismaCli.trade.createMany({
      data: trades.map(trade => {
        const fee = JSON.stringify(trade.fee)
        const timestamp = new Date(trade.timestamp)
        return {
          id: trade.id,
          amount: trade.amount,
          cost: trade.cost,
          datetime: trade.datetime,
          fee,
          info: trade.info,
          order: trade.order,
          price: trade.price,
          side: trade.side,
          symbol: trade.symbol,
          timestamp,
          type: trade.type,
          takerOrMaker: trade.takerOrMaker,
          userExchangeId: this.userExchangeId,
          userId: this.userId,
        }
      }),
    })
  }

  async fetchAndStoreSingleTrade() {
    if (!this.exchange) {
      throw new ApiError(500, 'Exchange not initialized')
    }
    const [trade] = await this.exchange.fetchMyTrades(undefined, undefined, 1)
    const fee = JSON.stringify(trade.fee)
    const timestamp = new Date(trade.timestamp)
    const tradeData = {
      id: trade.id,
      amount: trade.amount,
      cost: trade.cost,
      datetime: trade.datetime,
      fee,
      info: trade.info,
      order: trade.order,
      price: trade.price,
      side: trade.side,
      symbol: trade.symbol,
      timestamp,
      type: trade.type,
      takerOrMaker: trade.takerOrMaker,
      userExchangeId: this.userExchangeId,
    }
    await prismaCli.trade.create({
      data: tradeData,
    })
  }

  async fetchTrades(): Promise<Trade[]> {
    if (!this.exchange) {
      throw new ApiError(500, 'Exchange not initialized')
    }
    if (this.exchange.has['fetchTrades']) {
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
      return allTrades
    }
    throw new ApiError(400, 'Exchange does not support fetching trades')
  }
}
