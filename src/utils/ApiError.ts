class ApiError extends Error {
  statusCode: number
  isOperational: boolean
  constructor(statusCode = 500, message: string, isOperational = true, stack = '') {
    super(message)
    this.statusCode = statusCode
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
