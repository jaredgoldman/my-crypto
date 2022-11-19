import * as dotenv from 'dotenv'
dotenv.config()

type EnvConfig = {
  port: string | number
  DATABASE_URL: string
  JWT_SIGNING_SALT: string
  ENCRYPTION_KEY: string
  ENCRYPTION_SALT: string
  TEST_API_KEY: string
  TEST_API_SECRET: string
  NODE_ENV: string
  JEST_WORKER_ID?: string
  PINO_LOG_LEVEL?: string
}

const getEnv = (): EnvConfig => {
  return {
    port: parseInt(process.env.PORT || '8080', 10),
    DATABASE_URL: process.env.DATABASE_URL || '',
    JWT_SIGNING_SALT: process.env.JWT_SIGNING_SALT || '',
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
    ENCRYPTION_SALT: process.env.ENCRYPTION_SALT || '',
    TEST_API_KEY: process.env.TEST_API_KEY || '',
    TEST_API_SECRET: process.env.TEST_API_SECRET || '',
    NODE_ENV: process.env.NODE_ENV || 'development',
    JEST_WORKER_ID: process.env.JEST_WORKER_ID || undefined,
    PINO_LOG_LEVEL: process.env.PINO_LOG_LEVEL || 'info',
  }
}

const env: EnvConfig = getEnv()

export default env
