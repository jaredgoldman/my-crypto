import env from '../config/env'

export const areWeTestingWithJest = () => {
  return env.JEST_WORKER_ID !== undefined || env.NODE_ENV === 'test'
}

export const wait = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
