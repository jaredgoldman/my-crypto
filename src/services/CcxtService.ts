import ApiError from '../utils/ApiError'
import ccxt, { ExchangeId, Exchange } from 'ccxt'

export class CcxtService {
  private exchangeName: string
  private apiKey: string
  private secretKey: string
  private exchangeId: ExchangeId
  private exchange?: Exchange
  constructor(exchangeName: string, apiKey: string, secretKey: string) {
    this.exchangeId = exchangeName.toLowerCase() as ExchangeId

    if (!ccxt.exchanges.includes(this.exchangeId)) {
      throw new ApiError(400, 'Invalid exchange name')
    }

    this.exchangeName = exchangeName
    this.apiKey = apiKey
    this.secretKey = secretKey
  }

  async initializeExchange(): Promise<void> {
    this.exchange = new ccxt[this.exchangeId]({
      apiKey: this.apiKey,
      secret: this.secretKey,
    })
  }

  async fetchTrades() {
    if (!this.exchange) {
      throw new ApiError(500, 'Exchange not initialized')
    }

    const trades = await this.exchange.fetchTrades('BTC/CAD')
    console.log('TRADES', trades)
  }

  async setup(): Promise<void> {
    await this.initializeExchange()
  }
}
