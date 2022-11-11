export interface Response<T> {
  data: T | null
  message: ResponseMessage
}

export interface Paginated<T> {
  data: T[]
  next: number | null
  previous: number | null
}

export interface PaginatedResponse<T> {
  data: Paginated<T>
  message: ResponseMessage
}

export interface DecodedJwt {
  sub: string
  auth: string
  DEVICE_ID: string
  exp: number
  iat: number
}

export enum ResponseMessage {
  success = 'success',
  error = 'error',
  notFound = 'not found',
}
