import env from '../config/env'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError'
import { DecodedJwt } from 'src/types/api'

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
        jwt.verify(token, env.JWT_SIGNING_SALT, (err: any, decoded: any) => {
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
      } catch (err) {
        reject(new ApiError(401, 'Unauthorized', true, JSON.stringify(err)))
      }
    })
  }
  return Promise.reject(new ApiError(401, 'Unauthorized', true))
}
