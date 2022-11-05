import env from '../config/env'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError'
import { DecodedJwt } from 'src/types/api'

const generateSecret = (token: string): string => {
  const { iat } = jwt.decode(token) as Record<string, string | number>
  const t = Math.floor((iat as number) / 86400) * 86400
  const sugar = env.JWT_SIGNING_SALT.split('').reverse().join('')
  return `${env.JWT_SIGNING_SALT + t + sugar}`.padEnd(63, ' ') + '$'
}

export const expressAuthentication = (
  request: express.Request,
  securityName: string,
  scopes: string[] = []
): Promise<DecodedJwt> => {
  if (securityName === 'jwt') {
    const token =
      request.body.token || request.query.token || request.headers.authorization
    return new Promise(async (resolve, reject) => {
      if (!token) {
        reject(new ApiError(401, 'Unauthorized'))
      }
      try {
        jwt.verify(token, generateSecret(token), (err: any, decoded: any) => {
          if (err) {
            reject(new ApiError(401, 'Unauthorized', true, err))
          } else {
            // Check if JWT contains all required scopes
            // for (let scope of scopes) {
            //     if (!decoded.scopes.includes(scope)) {
            //         reject(new Error('JWT does not contain required scope.'))
            //     }
            // }
            resolve(decoded)
          }
        })
      } catch (error) {
        reject(new ApiError(401, 'Unauthorized', true, JSON.stringify(error)))
      }
    })
  }
  return Promise.reject(new ApiError(401, 'Unauthorized', true))
}
