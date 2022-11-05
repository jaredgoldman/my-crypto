import pino from 'pino'
import pinoHttp from 'pino-http'

const pinoLogger = pino(
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

export const httpLogger = pinoHttp({
  logger: pinoLogger,
  level: process.env.PINO_LOG_LEVEL || 'info',
  customLogLevel: (_, res, err) => {
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
  public static info(message: string, data?: any) {
    pinoLogger.info(message, data)
  }
  public static warn(message: string, data?: any) {
    pinoLogger.warn(message, data)
  }
  public static error(message: string, data?: any) {
    pinoLogger.error(message, data)
  }
  public static debug(message: string, data?: any) {
    pinoLogger.debug(message, data)
  }
}

export const initLog = async (): Promise<string> => {
  return 'Database connection has been established successfully.'
}
