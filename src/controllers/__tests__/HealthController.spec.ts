import request from 'supertest'
import { app } from 'src/app'

describe('GET /health', () => {
  test('should return 200 OK', () => {
    return request(app).get('/health').expect(200)
  })
})
