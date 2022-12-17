import env from '../config/env'
import * as express from 'express'
import ApiError from '../utils/ApiError'
import { UserService } from '../services/UserService'
import { KeyService } from '../services/KeyService'
import { Logger } from '@src/config/logger'

export const expressAuthentication = async (
  request: express.Request,
  securityName: string,
  scopes: string[] = []
) => {
  const keyService = new KeyService()
  const userService = new UserService()
  const token =
    request.body.token || request.query.token || request.headers['authorization']

  if (securityName === SecurityName.jwt) {
    const decoded = await keyService.verifyJwt(token, env.JWT_SIGNING_SALT)
    if (!decoded) {
      Logger.warn('authentication.jwt')
      throw new ApiError('general.unauthorized')
    }
  }

  if (securityName === SecurityName.basic) {
    const { email, password } = getBasicAuth(request)
    const user = await userService.authenticate(email, password)

    if (user) {
      return user
    }
  }
  Logger.warn('authentication.basic')
  throw new ApiError('general.unauthorized')
}

const getBasicAuth = (request: express.Request): { email: string; password: string } => {
  const base64UserPass = request.headers.authorization?.replace('Basic ', '')
  if (!base64UserPass) {
    throw new ApiError('general.unauthorized')
  }
  const [email, password] = Buffer.from(base64UserPass, 'base64')
    .toString('ascii')
    .split(':')
  return { email, password }
}

export enum SecurityName {
  jwt = 'jwt',
  basic = 'basic',
  exchange = 'exchange',
}
