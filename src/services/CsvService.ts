import { Trade } from '@prisma/client'
import fs from 'fs'
import converter from 'json-2-csv'
import { Logger } from '@src/config/logger'

export class CsvService {
  public generateTradeCsv(trades: Trade[]): boolean {
    try {
      if (!fs.existsSync('csv')) {
        fs.mkdirSync('csv')
      }
      converter.json2csv(trades, (err, csv) => {
        if (err) {
          throw err
        }
        if (csv) {
          fs.writeFileSync('csv/trades.csv', csv)
        }
      })
      return true
    } catch (err) {
      Logger.error('csv.general', err)
      return false
    }
  }
}
