import express, { Request, Response, NextFunction } from 'express'
import bodyParser from 'body-parser'
import { RegisterRoutes } from '../build/routes'
import { httpLogger } from './config/logger'
import swaggerUi from 'swagger-ui-express'
import { ValidateError } from 'tsoa'
import swagger from '../build/swagger.json'
import { NotFound } from 'http-errors'
import ApiError from './utils/ApiError'

export const app = express()

app.use(httpLogger)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Use body parser to read sent json payloads
app.use('/docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(swagger))
})

app.use('/swagger.json', swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.json(swagger)
})

RegisterRoutes(app)

app.use(function notFoundHandler(_req: Request, res: Response) {
  res.status(404).send({
    message: 'Not Found',
  })
})

app.use(function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response | void {
  if (err instanceof ValidateError) {
    console.warn(`Caught Validation Error for ${req.path}:`, err.fields)
    return res.status(422).json({
      message: 'Validation Failed',
      details: err?.fields,
    })
  }
  if (err instanceof NotFound) {
    return res.status(404).json({
      message: err.message,
    })
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJson())
  }
  if (err instanceof Error) {
    return res.status(500).json({
      message: err.message || 'Internal Server Error',
    })
  }

  next()
})
