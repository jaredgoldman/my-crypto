import * as dotenv from 'dotenv'
dotenv.config()

type EnvConfig = {
  port: string | number
  DATABASE_URL: string
  JWT_SIGNING_SALT: string
  PINO_LOG_LEVEL?: string
}

const getEnv = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '8080', 10),
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SIGNING_SALT: process.env.JWT_SIGNING_SALT || '',
    PINO_LOG_LEVEL: process.env.PINO_LOG_LEVEL || 'info',
  }
}

const env: EnvConfig = getEnv()

export default env
