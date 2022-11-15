import env from '../config/env'
import bcrypt from 'bcrypt'
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

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
}
