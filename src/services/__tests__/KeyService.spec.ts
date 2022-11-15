import { KeyService } from '../KeyService'

describe('KeyService encryption methods', () => {
  const keyService = new KeyService()
  it('should encrypt and decrypt a string', () => {
    const unencrypted = 'test-password'
    const encrypted = keyService.encrypt(unencrypted)
    const decrypted = keyService.decrypt(encrypted)
    expect(decrypted).toBe('test-password')
  })
})
