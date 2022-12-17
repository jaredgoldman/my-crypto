import { Logger } from '../config/logger'
import errorMessages from '../content/errorMessages.json'
import { getObjectPropFromPath } from './common'

class ApiError extends Error {
  statusCode: number
  isOperational: boolean
  constructor(messagePath: string, isOperational = true, stack = '') {
    let errorData = getObjectPropFromPath(errorMessages, messagePath)
    if (!errorData) {
      Logger.warn(`Error message path ${messagePath} not found`)
      errorData = { code: 500, message: 'Internal Server Error' }
    }
    super(errorData.message)
    this.statusCode = errorData.code
    this.isOperational = isOperational
    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
  toJson(): ErrorJSON {
    return { message: this.message, details: { stack: this.stack } }
  }
}

export default ApiError

export interface ErrorJSON {
  message: string
  details?: { [name: string]: unknown }
}
