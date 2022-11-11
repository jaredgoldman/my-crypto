import env from '../config/env'
import * as express from 'express'
import * as jwt from 'jsonwebtoken'
import ApiError from '../utils/ApiError'
import { DecodedJwt } from '../types/api'
import { UserService } from '../services/UserService'
import { User } from '@prisma/client'

export const expressAuthentication = (
  request: express.Request,
  securityName: string,
  scopes: string[] = []
): Promise<DecodedJwt | { token: string; user: User }> => {
  return new Promise(async (resolve, reject) => {
    try {
      if (securityName === 'jwt') {
        const token =
          request.body.token || request.query.token || request.headers['authorization']
        if (!token) {
          reject(new ApiError(401, 'Unauthorized'))
        }
        jwt.verify(token, env.JWT_SIGNING_SALT, function (err: any, decoded: any) {
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
      }

      if (securityName === 'login') {
        const userService = new UserService()
        const email =
          request.body.email || request.query.email || request.headers['x-email']
        const password =
          request.body.password || request.query.password || request.headers['x-password']
        resolve(await userService.login(email, password))
      }
    } catch (error) {
      reject(new ApiError(401, 'Unauthorized', true, JSON.stringify(error)))
    }
    reject(new ApiError(401, 'Unauthorized', true))
  })
}
