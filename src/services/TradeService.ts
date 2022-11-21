import { prismaCli } from '../config/db'

export class TradeService {
  public async getTrades(userId: string) {
    return await prismaCli.trade.findMany({
      where: {
        userId,
      },
    })
  }
}
