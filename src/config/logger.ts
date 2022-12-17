import pino from 'pino'
import pinoHttp from 'pino-http'
import errorMessages from '../content/errorMessages.json'
import { areWeTestingWithJest, getObjectPropFromPath } from '../utils/common'

const testPino = pino({ level: 'silent' })

const pinoLogger = areWeTestingWithJest()
  ? testPino
  : pino(
      {
        formatters: {
          level: label => {
            return { level: label }
          },
        },
      },
      pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
        },
      })
    )

const httpLogger = pinoHttp({
  logger: pinoLogger,
  customLogLevel: (_, res, err) => {
    if (areWeTestingWithJest()) {
      return 'silent'
    }
    if (res.statusCode >= 500 || err) {
      return 'error'
    }
    if (res.statusCode >= 400) {
      return 'warn'
    }
    return 'info'
  },
})

export class Logger {
  public static info(messagePath: string, data?: any) {
    pinoLogger.info(this.getErrorMessage(messagePath), data)
  }
  public static warn(messagePath: string, data?: any) {
    pinoLogger.warn(this.getErrorMessage(messagePath), data)
  }
  public static error(messagePath: string, data?: any) {
    pinoLogger.error(this.getErrorMessage(messagePath), data)
  }
  public static debug(messagePath: string, data?: any) {
    pinoLogger.debug(this.getErrorMessage(messagePath), data)
  }

  private static getErrorMessage(messagePath: string) {
    let message = getObjectPropFromPath(errorMessages, messagePath)?.message
    if (message) {
      return message
    }
    return 'Incorrect message path'
  }
}

export const initLog = async (): Promise<string> => {
  return 'Database connection has been established successfully.'
}

export default httpLogger
