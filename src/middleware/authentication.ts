import env from '../config/env'
import * as express from 'express'
import ApiError from '../utils/ApiError'
import { UserService } from '../services/UserService'
import { KeyService } from '../services/KeyService'

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
    return await keyService.verifyJwt(token, env.JWT_SIGNING_SALT)
  }

  if (securityName === SecurityName.basic) {
    const { email, password } = getBasicAuth(request)
    const user = await userService.authenticate(email, password)

    if (!user) {
      throw new ApiError(401, 'Unauthorized')
    }
    return user
  }
  throw new ApiError(401, 'Unauthorized')
}

const getBasicAuth = (request: express.Request): { email: string; password: string } => {
  const base64UserPass = request.headers.authorization?.replace('Basic ', '')
  if (!base64UserPass) {
    throw new ApiError(401, 'Unauthorized')
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
