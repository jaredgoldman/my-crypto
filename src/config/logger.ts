import pino from 'pino'
import pinoLogger from 'pino-http'
import * as Express from 'express'
import ApiError from '../utils/ApiError'

export const logger = pinoLogger({
  logger: pino({ name: 'bitbuy-api-stocks' }),
  level: Boolean(process.env.NODE_ENV === 'test') ? 'silent' : 'info',
  customLogLevel: function (req: Express.Request, res: Express.Response, err: ApiError) {
    if (res.statusCode >= 400 && res.statusCode < 500) {
      return 'warn'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    } else if (res.statusCode >= 300 && res.statusCode < 400) {
      return 'silent'
    }
    return 'info'
  },
})
