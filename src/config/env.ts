import * as dotenv from 'dotenv'
import * as envalid from 'envalid'
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
  TEST_EXCHANGE_NAME: string
  JEST_WORKER_ID?: string
  PINO_LOG_LEVEL?: string
}

const env = envalid.cleanEnv(process.env, {
  port: envalid.port({
    default: 8080,
    desc: 'The port the server will listen on',
  }),
  DATABASE_URL: envalid.str({
    desc: 'The database url',
  }),
  JWT_SIGNING_SALT: envalid.str({
    desc: 'The salt used to sign the JWT',
    default: 'salt',
  }),
  ENCRYPTION_KEY: envalid.str({
    desc: 'The key used to encrypt the user API key and secret',
    default: 'key',
  }),
  ENCRYPTION_SALT: envalid.str({
    desc: 'The salt used to encrypt the user API key and secret',
    default: 'salt',
  }),
  TEST_API_KEY: envalid.str({
    desc: 'The test API key',
  }),
  TEST_API_SECRET: envalid.str({
    desc: 'The test API secret',
  }),
  NODE_ENV: envalid.str({
    desc: 'The environment the server is running in',
    default: 'development',
  }),
  TEST_EXCHANGE_NAME: envalid.str({
    desc: 'The exchange name used for testing',
    default: 'kraken',
  }),
  JEST_WORKER_ID: envalid.str({
    default: undefined,
  }),
  PINO_LOG_LEVEL: envalid.str({
    desc: 'The log level for pino',
    choices: ['info', 'debug', 'trace', 'warn', 'error', 'fatal'],
    default: 'info',
  }),
})

export default env as EnvConfig
