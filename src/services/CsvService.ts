import { Trade } from '@prisma/client'
import ApiError from '../utils/ApiError'
import fs from 'fs'
import converter from 'json-2-csv'

export class CsvService {
  public generateTradeCsv(trades: Trade[]) {
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
    } catch (err) {
      throw new ApiError(500, 'Failed to export trades.')
    }
  }
}
