import {
  randEmail,
  randPassword,
  randCompanyName,
  randUrl,
  randFullName,
} from '@ngneat/falso'
import { UserCreateParams } from '@services/UserService'
import { v4 as uuid } from 'uuid'

export const getUserData = (): UserCreateParams => {
  return {
    email: randEmail(),
    password: randPassword(),
    name: randFullName(),
  }
}

export const getExchangeData = () => {
  return {
    name: randCompanyName(),
    url: randUrl(),
    image: randUrl(),
  }
}

export const getUserExchangeData = (exchangeId?: string, userExchangeKeyId?: string) => {
  return {
    userId: uuid(),
    exchangeId: exchangeId ? exchangeId : uuid(),
    userExchangeKeyId: userExchangeKeyId ? userExchangeKeyId : uuid(),
  }
}
