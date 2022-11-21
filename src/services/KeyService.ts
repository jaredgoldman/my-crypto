import env from '../config/env'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { User } from '@prisma/client'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import ApiError from '../utils/ApiError'

interface HashedKey {
  iv: string
  encryptedKey: string
}

export class KeyService {
  private algorithm
  private encryptionKey
  private encryptionSalt

  constructor() {
    this.algorithm = 'aes-256-ctr'
    this.encryptionKey = env.ENCRYPTION_KEY
    this.encryptionSalt = env.ENCRYPTION_SALT
  }

  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10)
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash)
  }

  public encrypt(unencrypted: string): HashedKey {
    const iv = randomBytes(16)
    const cipher = createCipheriv(this.algorithm, this.encryptionKey, iv)
    const encrypted = Buffer.concat([cipher.update(unencrypted), cipher.final()])
    return {
      iv: iv.toString('hex'),
      encryptedKey: encrypted.toString('hex'),
    }
  }

  public decrypt = (hash: HashedKey) => {
    const decipher = createDecipheriv(
      this.algorithm,
      this.encryptionKey,
      Buffer.from(hash.iv, 'hex')
    )

    const decrpyted = Buffer.concat([
      decipher.update(Buffer.from(hash.encryptedKey, 'hex')),
      decipher.final(),
    ])

    return decrpyted.toString()
  }

  public verifyJwt(token: string, secret: string): Promise<string | object> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, secret, function (err: any, decoded: any) {
        if (err) {
          reject(new ApiError(401, 'Unauthorized', true, err))
        } else {
          resolve(decoded)
        }
      })
    })
  }

  public generateSessionToken(user: User): string {
    const { id, email } = user
    const secret = env.JWT_SIGNING_SALT
    const token = jwt.sign({ sub: id, email }, secret, {
      expiresIn: '10d',
    })
    return token
  }
}
